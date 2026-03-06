import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyService } from './shopify.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shopifyService: ShopifyService,
  ) {}

  async syncFromShopify() {
    this.logger.log('Starting Shopify sync...');
    const productsData = await this.shopifyService.fetchAllProducts();

    let productsSynced = 0;
    let variantsSynced = 0;
    const errors: string[] = [];

    const syncedAt = new Date();

    for (const p of productsData) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const product = await tx.product.upsert({
            where: { shopifyId: p.shopifyId },
            update: {
              title: p.title,
              description: p.description,
              handle: p.handle,
              vendor: p.vendor,
              productType: p.productType,
              status: p.status,
              images: p.images as Prisma.JsonArray,
              syncedAt,
            },
            create: {
              shopifyId: p.shopifyId,
              title: p.title,
              description: p.description,
              handle: p.handle,
              vendor: p.vendor,
              productType: p.productType,
              status: p.status,
              images: p.images as Prisma.JsonArray,
              syncedAt,
            },
          } as any);

          productsSynced++;

          for (const v of p.variants) {
            await tx.productVariant.upsert({
              where: { shopifyVariantId: v.shopifyVariantId },
              update: {
                productId: product.id,
                title: v.title,
                sku: v.sku,
                price: v.price ? new Prisma.Decimal(v.price) : undefined,
                compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : undefined,
                inventoryQuantity: v.inventoryQuantity,
                option1: v.option1,
                option2: v.option2,
                option3: v.option3,
                imageUrl: v.imageUrl,
              },
              create: {
                shopifyVariantId: v.shopifyVariantId,
                productId: product.id,
                title: v.title,
                sku: v.sku,
                price: v.price ? new Prisma.Decimal(v.price) : undefined,
                compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : undefined,
                inventoryQuantity: v.inventoryQuantity,
                option1: v.option1,
                option2: v.option2,
                option3: v.option3,
                imageUrl: v.imageUrl,
              },
            } as any);
            variantsSynced++;
          }
        });
      } catch (error: any) {
        this.logger.error(`Failed to sync product ${p.shopifyId}: ${error.message}`);
        errors.push(`Product ${p.shopifyId}: ${error.message}`);
      }
    }

    return {
      productsSynced,
      variantsSynced,
      syncedAt,
      errors,
    };
  }

  async getActiveProducts(search?: string, productType?: string) {
    const whereClause: Prisma.ProductWhereInput = {
      status: 'active',
    };

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }

    if (productType) {
      (whereClause as any).product_type = productType;
    }

    return this.prisma.product.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    } as any);
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: 'active' },
      include: {
        variants: {
          orderBy: { price: 'asc' },
        },
      },
    } as any);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found or not active`);
    }

    return product;
  }
}
