import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus, Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { ShopifyInventoryService } from '../shopify/shopify-inventory.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private shopifyInventory: ShopifyInventoryService,
  ) {}

  async create(dealerId: number, createOrderDto: CreateOrderDto) {
    // 1. Fetch current prices for all variants
    const variantIds = createOrderDto.items.map((item) => item.variantId);
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    if (variants.length !== variantIds.length) {
      throw new NotFoundException('One or more product variants not found');
    }

    // 2. Map prices and calculate total
    const itemsWithPricing = createOrderDto.items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant) {
        throw new NotFoundException(`Variant #${item.variantId} not found`);
      }
      const unitPrice = variant.price ? variant.price.mul(0.5).toDecimalPlaces(2) : new Prisma.Decimal(0);
      return {
        productVariantId: item.variantId,
        quantity: item.quantity,
        unitPrice: unitPrice,
      };
    });

    const totalAmount = itemsWithPricing.reduce((sum, item) => {
      return sum + Number(item.unitPrice) * item.quantity;
    }, 0);

    // 3. Create order and items in a transaction
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          dealerId,
          totalAmount,
          status: OrderStatus.draft,
          items: {
            create: itemsWithPricing,
          },
        },
        include: {
          items: true,
        },
      });
      return order;
    });
  }

  async findAll(page: number = 1, limit: number = 10, dealerId?: number, excludeDrafts: boolean = false) {
    const skip = (page - 1) * limit;
    let where: any = dealerId ? { dealerId } : {};

    if (excludeDrafts) {
      where.status = { not: OrderStatus.draft };
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          dealer: {
            select: { companyName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async findOne(id: number, dealerId?: number, lang: string = 'tr') {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
        dealer: true,
      },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);
    if (dealerId && order.dealerId !== dealerId) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    // Extract locale-specific strings from JSON title fields
    const getLang = (obj: any, fallback = '') => {
      if (!obj) return fallback;
      if (typeof obj === 'string') return obj;
      return obj[lang] || obj['tr'] || obj['en'] || fallback;
    };

    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productVariant: {
          ...item.productVariant,
          title: getLang(item.productVariant.title, ''),
          product: {
            ...item.productVariant.product,
            title: getLang(item.productVariant.product.title, ''),
            description: getLang(item.productVariant.product.description, ''),
          },
        },
      })),
    };
  }

  async updateStatus(id: number, status: OrderStatus, adminEmail: string, paymentAmount?: number) {
    const order = await this.prisma.order.findUnique({ 
      where: { id },
      include: {
        items: {
          include: {
            productVariant: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException(`Order #${id} not found`);

    // Determine auto-note based on transition
    let additionalNote = '';
    if (status === OrderStatus.first_payment_received) {
      if (paymentAmount !== undefined) {
        const remaining = Number(order.totalAmount) - paymentAmount;
        additionalNote = `[${new Date().toLocaleString()}] First payment done with the amount ${paymentAmount.toFixed(2)} and still the rest of the order amount ${remaining.toFixed(2)} left.\n`;
      } else {
        additionalNote = `[${new Date().toLocaleString()}] First payment received and confirmed.\n`;
      }
    } else if (status === OrderStatus.paid) {
      additionalNote = `[${new Date().toLocaleString()}] Remaining balance paid. Order fully settled.\n`;
    }

    // Update DB status and append notes
    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: { 
        status,
        statusChangedByEmail: adminEmail,
        statusChangedAt: new Date(),
        notes: additionalNote ? (order.notes ? (order as any).notes + additionalNote : additionalNote) : undefined,
        firstPaymentAmount: status === OrderStatus.first_payment_received ? paymentAmount : undefined,
        remainingAmount: status === OrderStatus.first_payment_received ? (Number(order.totalAmount) - (paymentAmount || 0)) : undefined
      } as any,
    });

    // Deduct local inventory when dealer submits the order (draft → pending_first_payment)
    if (order.status === OrderStatus.draft && status === OrderStatus.pending_first_payment) {
      this.logger.log(`Order #${id} submitted. Deducting local inventory.`);
      for (const item of order.items) {
        await this.prisma.productVariant.update({
          where: { id: item.productVariant.id },
          data: {
            inventoryQuantity: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    // Restore local inventory if order is cancelled after being active
    const activeStatuses: OrderStatus[] = [
      OrderStatus.pending_first_payment,
      OrderStatus.first_payment_received,
      OrderStatus.shipped,
      OrderStatus.received,
      OrderStatus.pending_rest_payment,
      OrderStatus.paid,
    ];
    if (activeStatuses.includes(order.status) && status === OrderStatus.cancelled) {
      this.logger.log(`Order #${id} cancelled. Restoring local inventory.`);
      for (const item of order.items) {
        await this.prisma.productVariant.update({
          where: { id: item.productVariant.id },
          data: {
            inventoryQuantity: {
              increment: item.quantity
            }
          }
        });
      }
    }

    // Trigger Shopify Inventory Sync when admin marks as shipped
    if (status === OrderStatus.shipped && !(order as any).inventorySynced) {
      try {
        const items = order.items.map(item => ({
          shopifyVariantId: item.productVariant.shopifyVariantId,
          quantity: item.quantity,
        }));

        await this.shopifyInventory.deductOrderInventory(items);

        await this.prisma.order.update({
          where: { id },
          data: {
            inventorySynced: true,
            inventorySyncedAt: new Date(),
          } as any,
        });
        
        this.logger.log(`Successfully synced inventory for order #${id}`);
      } catch (error) {
        this.logger.error(`Failed to sync inventory for order #${id}: ${error.message}`);
      }
    }

    return updatedOrder;
  }

  async exportOrdersToExcel(
    startDate?: string,
    endDate?: string,
    status?: OrderStatus | 'all',
  ) {
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      whereClause.createdAt = {
        gte: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.createdAt = {
        lte: new Date(endDate),
      };
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        dealer: {
          include: { user: { select: { email: true } } },
        },
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = orders.map((order) => ({
      'Order ID': `#${order.id.toString().padStart(5, '0')}`,
      'Dealer': order.dealer.companyName,
      'Email': order.dealer.user.email,
      'Date': order.createdAt.toLocaleDateString(),
      'Status': order.status.replace('_', ' ').toUpperCase(),
      'Total Amount': Number(order.totalAmount).toFixed(2),
      'Items Count': order.items.length,
      'Products': order.items
        .map((i) => { const t = i.productVariant.product.title; const title = typeof t === 'string' ? t : (t as any)?.tr || (t as any)?.en || ''; return `${title} (${i.quantity})`; })
        .join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async remove(id: number, dealerId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundException(`Order #${id} not found`);

    // Dealers can only delete their own draft orders
    if (dealerId) {
      if (order.dealerId !== dealerId) {
        throw new NotFoundException(`Order #${id} not found`);
      }
      if (order.status !== OrderStatus.draft) {
        throw new Error('Only draft orders can be deleted');
      }
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }
}
