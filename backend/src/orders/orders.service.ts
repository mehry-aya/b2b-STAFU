import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
      return {
        productVariantId: item.variantId,
        quantity: item.quantity,
        unitPrice: variant.price || 0,
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

  async findAll(dealerId?: number) {
    return this.prisma.order.findMany({
      where: dealerId ? { dealerId } : {},
      include: {
        dealer: {
          select: { companyName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, dealerId?: number) {
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

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException(`Order #${id} not found`);

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
