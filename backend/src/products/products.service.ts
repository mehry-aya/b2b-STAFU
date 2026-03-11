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

  // Sync products & variants from Shopify
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
          // Ensure all collections exist
          const collectionConnections: { id: number }[] = [];
          for (const c of p.collections) {
            const collection = await (tx as any).collection.upsert({
              where: { shopifyId: c.shopifyId },
              update: { title: c.title, handle: c.handle },
              create: { shopifyId: c.shopifyId, title: c.title, handle: c.handle },
            });
            collectionConnections.push({ id: collection.id });
          }

          // Upsert product
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
              collections: { set: collectionConnections },
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
              collections: { connect: collectionConnections },
            },
          } as any);

          productsSynced++;

          // Upsert variants
          for (const v of p.variants) {
            await tx.productVariant.upsert({
              where: { shopifyVariantId: v.shopifyVariantId },
              update: {
                productId: product.id,
                title: v.title,
                sku: v.sku,
                price: v.price ? new Prisma.Decimal(v.price) : undefined,
                compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : undefined,
                inventoryQuantity: v.inventoryQuantity ?? 0, // ensures no null
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
                inventoryQuantity: v.inventoryQuantity ?? 0, // ensures no null
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

    return { productsSynced, variantsSynced, syncedAt, errors };
  }

  // Fetch Shopify categories
  async getCategories() {
    return this.shopifyService.getCategories();
  }

  // Fetch active products, with optional filters
  async getActiveProducts(
    search?: string,
    productType?: string,
    allStatuses: boolean = false,
    categoryHandle?: string,
    inStockOnly: boolean = false, // only include products with inventory > 0
  ) {
    const whereClause: any = {};

    if (!allStatuses) whereClause.status = 'active';

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { vendor: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (productType) whereClause.productType = productType;

    if (categoryHandle) {
      whereClause.collections = {
        some: { handle: { equals: categoryHandle, mode: 'insensitive' } },
      };
    }

    // Fetch products with variants
    let products = await (this.prisma.product as any).findMany({
      where: whereClause,
      include: { variants: true },
      orderBy: { title: 'asc' },
    });

    // Filter in-stock products
    if (inStockOnly) {
      products = products.filter(product =>
        product.variants.some((v: any) => (v.inventoryQuantity || 0) > 0)
      );
    }

    return products.map((p: any) => this.mapProduct(p));
  }

  // Fetch a single product by ID
  async getProductById(id: number) {
    const product = await (this.prisma.product as any).findFirst({
      where: { id, status: 'active' },
      include: { variants: { orderBy: { price: 'asc' } } },
    });

    if (!product) throw new NotFoundException(`Product with ID ${id} not found or not active`);

    return this.mapProduct(product);
  }

  // Map Decimal values to string for front-end
  private mapProduct(product: any) {
    return {
      ...product,
      variants: product.variants?.map((v: any) => ({
        ...v,
        price: v.price?.toString() || null,
        compareAtPrice: v.compareAtPrice?.toString() || null,
      })),
    };
  }
}