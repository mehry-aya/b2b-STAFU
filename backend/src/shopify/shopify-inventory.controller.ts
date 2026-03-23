import { Controller, Get, Param, Post, NotFoundException, Logger } from '@nestjs/common';
import { ShopifyInventoryService } from './shopify-inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Controller('api/shopify')
export class ShopifyInventoryController {
  private readonly logger = new Logger(ShopifyInventoryController.name);

  constructor(
    private readonly shopifyInventoryService: ShopifyInventoryService,
    private readonly prisma: PrismaService,
  ) {}

  // TODO: REMOVE BEFORE PRODUCTION
  @Get('check-stock/:variantId')
  async checkStock(@Param('variantId') variantId: string) {
    const stock = await this.shopifyInventoryService.getStock(variantId);
    return { variantId, stock };
  }

  // TODO: REMOVE BEFORE PRODUCTION
  @Post('restore-order/:orderId')
  async restoreOrder(@Param('orderId') orderId: string) {
    const id = parseInt(orderId, 10);
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

    if (!order) {
      throw new NotFoundException(`Order #${orderId} not found`);
    }

    try {
      const items = order.items.map(item => ({
        shopifyVariantId: item.productVariant.shopifyVariantId,
        quantity: item.quantity,
      }));

      await this.shopifyInventoryService.restoreOrderInventory(items);

      await this.prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.draft, // Reset to draft for testing as requested (instruction said processing, but schema uses draft/pending_payment/etc)
          inventorySynced: false,
          inventorySyncedAt: null,
        } as any,
      });

      return { message: `Inventory restored for order #${orderId} and status reset to draft` };
    } catch (error) {
      this.logger.error(`Failed to restore inventory for order #${orderId}: ${error.message}`);
      throw error;
    }
  }
}
