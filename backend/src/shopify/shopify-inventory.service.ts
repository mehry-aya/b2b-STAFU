import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class ShopifyInventoryService {
  private readonly logger = new Logger(ShopifyInventoryService.name);
  private readonly storeDomain: string;
  private readonly accessToken: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.storeDomain = this.configService.get<string>('SHOPIFY_STORE_URL') || '';
    this.accessToken = this.configService.get<string>('SHOPIFY_ADMIN_API_TOKEN') || '';
    const cleanDomain = this.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.apiUrl = `https://${cleanDomain}/admin/api/2026-01/graphql.json`;
  }

  async getInventoryInfo(shopifyVariantId: string): Promise<{ inventoryItemId: string; locationId: string }> {
    const query = `
      query getInventoryInfo($id: ID!) {
        productVariant(id: $id) {
          inventoryItem {
            id
            inventoryLevels(first: 1) {
              edges {
                node {
                  location {
                    id
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          { query, variables: { id: shopifyVariantId } },
          {
            headers: {
              'X-Shopify-Access-Token': this.accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data?.errors) {
        this.logger.error(`Shopify API Errors for ${shopifyVariantId}: ${JSON.stringify(response.data.errors)}`);
      }

      const data = response.data?.data?.productVariant;
      if (!data) {
        throw new Error(`Variant ${shopifyVariantId} not found in Shopify (or query failed)`);
      }

      const inventoryItemId = data.inventoryItem?.id;
      const locationId = data.inventoryItem?.inventoryLevels?.edges[0]?.node?.location?.id;

      if (!inventoryItemId) {
        throw new Error(`No inventory item found for variant ${shopifyVariantId}`);
      }

      if (!locationId) {
        throw new Error(`No location found for variant ${shopifyVariantId}`);
      }

      return { inventoryItemId, locationId };
    } catch (error) {
      if (!(error.message.includes('not found in Shopify'))) {
         this.logger.error(`Error fetching inventory info for ${shopifyVariantId}: ${error.message}`);
      }
      throw error;
    }
  }

  async deductInventory(shopifyVariantId: string, quantity: number): Promise<void> {
    const { inventoryItemId, locationId } = await this.getInventoryInfo(shopifyVariantId);
    
    const mutation = `
      mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
          inventoryAdjustmentGroup {
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        reason: "correction",
        name: "available",
        changes: [
          {
            delta: -quantity,
            inventoryItemId: inventoryItemId,
            locationId: locationId,
          },
        ],
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          { query: mutation, variables },
          {
            headers: {
              'X-Shopify-Access-Token': this.accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data?.errors) {
        this.logger.error(`Shopify mutation API errors: ${JSON.stringify(response.data.errors)}`);
        throw new Error(`Shopify mutation API errors: ${JSON.stringify(response.data.errors)}`);
      }

      const errors = response.data?.data?.inventoryAdjustQuantities?.userErrors;
      if (errors && errors.length > 0) {
        this.logger.error(`Shopify mutation user errors for ${shopifyVariantId}: ${JSON.stringify(errors)}`);
        throw new Error(`Shopify mutation user errors: ${JSON.stringify(errors)}`);
      }
    } catch (error) {
      this.logger.error(`Error deducción/restauración inventory for ${shopifyVariantId}: ${error.message}`);
      throw error;
    }
  }

  async restoreInventory(shopifyVariantId: string, quantity: number): Promise<void> {
    const { inventoryItemId, locationId } = await this.getInventoryInfo(shopifyVariantId);
    
    const mutation = `
      mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
          inventoryAdjustmentGroup {
            createdAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        reason: "restock",
        name: "available",
        changes: [
          {
            delta: quantity,
            inventoryItemId: inventoryItemId,
            locationId: locationId,
          },
        ],
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          { query: mutation, variables },
          {
            headers: {
              'X-Shopify-Access-Token': this.accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data?.errors) {
        this.logger.error(`Shopify mutation API errors: ${JSON.stringify(response.data.errors)}`);
        throw new Error(`Shopify mutation API errors: ${JSON.stringify(response.data.errors)}`);
      }

      const errors = response.data?.data?.inventoryAdjustQuantities?.userErrors;
      if (errors && errors.length > 0) {
        this.logger.error(`Shopify mutation user errors for ${shopifyVariantId}: ${JSON.stringify(errors)}`);
        throw new Error(`Shopify mutation user errors: ${JSON.stringify(errors)}`);
      }
    } catch (error) {
      this.logger.error(`Error restoring inventory for ${shopifyVariantId}: ${error.message}`);
      throw error;
    }
  }

  async deductOrderInventory(items: Array<{ shopifyVariantId: string; quantity: number }>): Promise<void> {
    await Promise.all(items.map(item => this.deductInventory(item.shopifyVariantId, item.quantity)));
  }

  async restoreOrderInventory(items: Array<{ shopifyVariantId: string; quantity: number }>): Promise<void> {
    await Promise.all(items.map(item => this.restoreInventory(item.shopifyVariantId, item.quantity)));
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCron() {
    this.logger.log('Running Shopify inventory sync retry cron...');
    const failedOrders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.shipped,
        inventorySynced: false,
      } as any,
      include: {
        items: {
          include: {
            productVariant: true,
          },
        },
      } as any,
    });

    for (const order of failedOrders) {
      try {
        const items = (order as any).items.map(item => ({
          shopifyVariantId: item.productVariant.shopifyVariantId,
          quantity: item.quantity,
        }));

        await this.deductOrderInventory(items);

        await this.prisma.order.update({
          where: { id: order.id },
          data: {
            inventorySynced: true,
            inventorySyncedAt: new Date(),
          } as any,
        });

        this.logger.log(`Successfully synced inventory for order #${order.id} on retry`);
      } catch (error) {
        this.logger.error(`Failed to sync inventory for order #${order.id} on retry: ${error.message}`);
      }
    }
  }

  // Helper for test controller
  async getStock(shopifyVariantId: string): Promise<number> {
    const query = `
      query getStock($id: ID!) {
        productVariant(id: $id) {
          inventoryQuantity
        }
      }
    `;

    const response = await firstValueFrom(
      this.httpService.post(
        this.apiUrl,
        { query, variables: { id: shopifyVariantId } },
        {
          headers: {
            'X-Shopify-Access-Token': this.accessToken,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data?.data?.productVariant?.inventoryQuantity ?? 0;
  }
}
