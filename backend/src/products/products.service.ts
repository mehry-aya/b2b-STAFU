import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyService } from './shopify.service';
import { SyncStatusService } from './sync-status.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private shopifyService: ShopifyService,
    private syncStatusService: SyncStatusService,
  ) {}

  // Sync products & variants from Shopify
async syncFromShopify() {
  this.logger.log('Starting Shopify sync...');
  this.syncStatusService.startSync(0);

  try {
    const totalCount = await this.shopifyService.fetchProductsCount();
    this.syncStatusService.setTotal(totalCount);
    this.logger.log(`Total products to sync: ${totalCount}`);
  } catch (error: any) {
    this.logger.warn(`Could not fetch total count: ${error.message}`);
  }

  let productsSynced = 0;
  let variantsSynced = 0;
  const errors: string[] = [];
  const syncedAt = new Date();
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    let page: Awaited<ReturnType<typeof this.shopifyService.fetchProductsPage>>;

    try {
      page = await this.shopifyService.fetchProductsPage(cursor);
    } catch (error: any) {
      this.logger.error(`Failed to fetch page from Shopify: ${error.message}`);
      this.syncStatusService.setError(error.message);
      throw error;
    }

    for (const p of page.products) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const collectionConnections = await this.syncCollections(tx, p.collections);
          const product = await this.syncProduct(tx, p, syncedAt, collectionConnections);

          productsSynced++;
          this.syncStatusService.updateProgress(productsSynced);

          const vSyncedCount = await this.syncVariants(tx, product.id, p.variants);
          variantsSynced += vSyncedCount;
        });
      } catch (error: any) {
        this.logger.error(`Failed to sync product ${p.shopifyId}: ${error.message}`);
        errors.push(`Product ${p.shopifyId}: ${error.message}`);
      }
    }

    hasNextPage = page.hasNextPage;
    cursor = page.endCursor;
  }

  this.syncStatusService.completeSync();
  return { productsSynced, variantsSynced, syncedAt, errors };
}
  private async syncCollections(tx: Prisma.TransactionClient, collections: any[]) {
    const collectionConnections: { id: number }[] = [];
    for (const c of collections) {
      const collection = await (tx as any).collection.upsert({
        where: { shopifyId: c.shopifyId },
        update: { title: c.title, handle: c.handle },
        create: { shopifyId: c.shopifyId, title: c.title, handle: c.handle },
      });
      collectionConnections.push({ id: collection.id });
    }
    return collectionConnections;
  }

  private async syncProduct(
    tx: Prisma.TransactionClient, 
    p: any, 
    syncedAt: Date, 
    collectionConnections: { id: number }[]
  ) {
    return await tx.product.upsert({
      where: { shopifyId: p.shopifyId },
      update: {
        title: p.title,
        description: p.description,
        handle: p.handle,
        vendor: p.vendor,
        productType: p.productType,
        status: p.status,
        images: p.images as Prisma.JsonArray,
        options: p.options as Prisma.JsonArray,
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
        options: p.options as Prisma.JsonArray,
        syncedAt,
        collections: { connect: collectionConnections },
      },
    } as any);
  }

  private async syncVariants(tx: Prisma.TransactionClient, productId: number, variants: any[]) {
    let count = 0;
    for (const v of variants) {
      await tx.productVariant.upsert({
        where: { shopifyVariantId: v.shopifyVariantId },
        update: {
          productId,
          title: v.title,
          sku: v.sku,
          price: v.price ? new Prisma.Decimal(v.price) : undefined,
          compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : undefined,
          inventoryQuantity: v.inventoryQuantity ?? 0,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          imageUrl: v.imageUrl,
        },
        create: {
          shopifyVariantId: v.shopifyVariantId,
          productId,
          title: v.title,
          sku: v.sku,
          price: v.price ? new Prisma.Decimal(v.price) : undefined,
          compareAtPrice: v.compareAtPrice ? new Prisma.Decimal(v.compareAtPrice) : undefined,
          inventoryQuantity: v.inventoryQuantity ?? 0,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          imageUrl: v.imageUrl,
        },
      } as any);
      count++;
    }
    return count;
  }

  // Fetch Shopify categories
  async getCategories() {
    return this.shopifyService.getCategories();
  }

  // Fetch products with pagination and optional filters
  async getProducts(
    search?: string,
    productType?: string,
    allStatuses: boolean = false,
    categoryHandle?: string,
    inStockOnly: boolean = false,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const whereClause: any = {};

    // For admin/all view, we can filter by specific status
    if (allStatuses) {
      if (status && status !== 'all') {
        whereClause.status = status;
      }
    } else {
      whereClause.status = 'active';
    }

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

    // Filter by stock if requested (Dealers)
    if (inStockOnly) {
      whereClause.variants = {
        some: {
          inventoryQuantity: { gt: 0 }
        }
      };
    }

    const skip = (page - 1) * limit;

    // Fetch total count for pagination
    const total = await (this.prisma.product as any).count({
      where: whereClause,
    });

    // Fetch products with variants
    let products = await (this.prisma.product as any).findMany({
      where: whereClause,
      include: { variants: true },
      orderBy: { title: 'asc' },
      skip,
      take: limit,
    });

    return {
      data: products.map((p: any) => this.mapProduct(p)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Fetch a single product by ID
  async getProductById(id: number) {
    const product = await (this.prisma.product as any).findFirst({
      where: { id, status: 'active' },
      include: { variants: { orderBy: { price: 'asc' } } },
    });

    if (!product) throw new NotFoundException(`Product with ID ${id} not found or not active`);

    const mappedProduct = this.mapProduct(product);

    // Find related products (colors) based on title prefix
    // Title format: "Product Name - Color Name"
    const titleParts = product.title.split(' - ');
    if (titleParts.length > 1) {
      const baseTitle = titleParts[0];
      const relatedProducts = await (this.prisma.product as any).findMany({
        where: {
          title: { startsWith: baseTitle },
          id: { not: id },
          status: 'active',
        },
        select: {
          id: true,
          title: true,
          handle: true,
          images: true,
        },
        take: 10,
      });

      (mappedProduct as any).relatedProducts = relatedProducts;
    }

    return mappedProduct;
  }

  // Map Decimal values to string for front-end
  private mapProduct(product: any) {
    return {
      ...product,
      variants: product.variants?.map((v: any) => {
        const originalPrice = v.price ? v.price.toDecimalPlaces(2) : null;
        const discountedPrice = originalPrice ? originalPrice.mul(0.5).toDecimalPlaces(2) : null;
        
        return {
          ...v,
          price: discountedPrice?.toString() || null,
          compareAtPrice: originalPrice?.toString() || null,
        };
      }),
    };
  }
}