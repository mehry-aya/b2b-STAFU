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

    let productsSynced = 0;
    let variantsSynced = 0;
    const errors: string[] = [];
    const syncedAt = new Date();

    try {
      const primaryLocale = await this.shopifyService.getPrimaryLocale();
      this.logger.log(`Shop primary locale: ${primaryLocale}`);

      const totalCount = await this.shopifyService.fetchProductsCount();
      this.syncStatusService.setTotal(totalCount);
      this.logger.log(`Total products to sync: ${totalCount}`);

      let cursor: string | null = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const page = await this.shopifyService.fetchProductsPage(cursor);

        let debugCount = 0;
        for (const p of page.products) {
          if (debugCount < 5) {
              console.log(`--- DEBUG Product ${p.shopifyId} ---`);
              console.log(`translationsTr: ${JSON.stringify(p.translationsTr, null, 2)}`);
              console.log(`translationsEn: ${JSON.stringify(p.translationsEn, null, 2)}`);
              debugCount++;
          }
          try {
            await this.prisma.$transaction(async (tx) => {
              const collectionConnections = await this.syncCollections(tx, p.collections);
              const product = await this.syncProduct(tx, p, syncedAt, collectionConnections, primaryLocale);

              productsSynced++;
              this.syncStatusService.updateProgress(productsSynced);

              const vSyncedCount = await this.syncVariants(tx, product.id, p.variants, primaryLocale);
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
    } catch (error: any) {
      this.logger.error(`Sync failed: ${error.message}`);
      errors.push(`Sync failed: ${error.message}`);
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
    collectionConnections: { id: number }[],
    primaryLocale: string
  ) {
    // Default Shopify content = Turkish (regardless of primaryLocale reported by API)
    // English translations are in translationsEn
    const enTitle = p.translationsEn?.find((t: any) => t.key === 'title')?.value || null;
    const enDescription = p.translationsEn?.find((t: any) => t.key === 'body_html')?.value || null;

    const title = { tr: p.title, en: enTitle || p.title };
    const description = { tr: p.description, en: enDescription || p.description };

    return await tx.product.upsert({
      where: { shopifyId: p.shopifyId },
      update: {
        title,
        description,
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
        title,
        description,
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

  private async syncVariants(tx: Prisma.TransactionClient, productId: number, variants: any[], primaryLocale: string) {
    let count = 0;

    for (const v of variants) {
      // Default Shopify content = Turkish, English in translationsEn
      const enTitle = v.translationsEn?.find((t: any) => t.key === 'title')?.value || null;
      const title = { tr: v.title, en: enTitle || v.title };

      await tx.productVariant.upsert({
        where: { shopifyVariantId: v.shopifyVariantId },
        update: {
          productId,
          title,
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
          title,
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
    lang: string = 'tr',
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
        { title: { path: [lang], string_contains: search } },
        { description: { path: [lang], string_contains: search } },
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
      // orderBy: { title: 'asc' }, // Order by JSON title is complex in Prisma, skipping for now
      skip,
      take: limit,
    });

    return {
      data: products.map((p: any) => this.mapProduct(p, lang)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Fetch a single product by ID
  async getProductById(id: number, lang: string = 'tr') {
    const product = await (this.prisma.product as any).findFirst({
      where: { id, status: 'active' },
      include: { variants: { orderBy: { price: 'asc' } } },
    });

    if (!product) throw new NotFoundException(`Product with ID ${id} not found or not active`);

    const mappedProduct = this.mapProduct(product, lang);

    // Find related products (colors) based on title prefix
    // Title format: { "tr": "Name - Color", "en": "Name - Color" }
    const titleObj = product.title as any;
    const currentTitle = titleObj[lang] || titleObj['en'] || '';
    const titleParts = currentTitle.split(' - ');
    
    if (titleParts.length > 1) {
      const baseTitle = titleParts[0];
      const relatedProducts = await (this.prisma.product as any).findMany({
        where: {
          title: { path: [lang], string_starts_with: baseTitle },
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

      (mappedProduct as any).relatedProducts = relatedProducts.map((rp: any) => ({
        ...rp,
        title: (rp.title as any)[lang] || (rp.title as any)['en'] || ''
      }));
    }

    return mappedProduct;
  }

  // Map Decimal values and extract correct locale
  private mapProduct(product: any, lang: string = 'tr') {
    const getLangValue = (obj: any, key: string) => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj; // Fallback for old data
      return obj[key] || obj['en'] || Object.values(obj)[0] || '';
    };

    return {
      ...product,
      title: getLangValue(product.title, lang),
      description: getLangValue(product.description, lang),
      variants: product.variants?.map((v: any) => {
        const originalPrice = v.price ? v.price.toDecimalPlaces(2) : null;
        const discountedPrice = originalPrice ? originalPrice.mul(0.5).toDecimalPlaces(2) : null;
        
        return {
          ...v,
          title: getLangValue(v.title, lang),
          price: discountedPrice?.toString() || null,
          compareAtPrice: originalPrice?.toString() || null,
        };
      }),
    };
  }
}