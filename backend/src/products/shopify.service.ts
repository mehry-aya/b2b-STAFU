import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { COUNT_QUERY, GET_CATEGORIES_QUERY, GET_PRODUCTS_QUERY } from 'src/shopify/shopify-queries';
import { ShopifyMapper } from 'src/shopify/shopify.mapper';

export interface ShopifyProductSyncPayload {
  shopifyId: string;
  title: string;
  description: string | null;
  handle: string | null;
  vendor: string | null;
  productType: string | null;
  status: string;
  images: any[];
  options: { name: string; values: string[] }[];
  variants: ShopifyVariantSyncPayload[];
  collections: { shopifyId: string; title: string; handle: string }[];
}

export interface ShopifyVariantSyncPayload {
  shopifyVariantId: string;
  title: string;
  sku: string | null;
  price: string | null;
  compareAtPrice: string | null;
  inventoryQuantity: number | null;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  imageUrl: string | null;
}

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);
  private readonly storeDomain: string;
  private readonly accessToken: string;
  private readonly apiUrl: string;
  private readonly storefrontAccessToken: string;
  private readonly storefrontApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.storeDomain = this.configService.get<string>('SHOPIFY_STORE_URL') || '';
    this.accessToken = this.configService.get<string>('SHOPIFY_ADMIN_API_TOKEN') || '';
    this.storefrontAccessToken = this.configService.get<string>('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN') || '';
    
    const cleanDomain = this.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.apiUrl = `https://${cleanDomain}/admin/api/2026-01/graphql.json`;
this.storefrontApiUrl = `https://${cleanDomain}/api/2026-01/graphql.json`;
  }

  private categoryCache: { data: any[]; timestamp: number } | null = null;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async getCategories(): Promise<any[]> {
    const now = Date.now();
    if (this.categoryCache && now - this.categoryCache.timestamp < this.CACHE_TTL) {
      this.logger.log('Returning categories from cache');
      return this.categoryCache.data;
    }

const query = GET_CATEGORIES_QUERY;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.storefrontApiUrl,
          { query },
          {
            headers: {
              'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const rawResponse = (response.data as any);
      if (rawResponse.errors) {
        this.logger.error('Shopify Storefront API Errors: ' + JSON.stringify(rawResponse.errors));
      }

      const menu = rawResponse.data?.menu;
      if (!menu) {
        this.logger.warn('Menu "b2b-menu" not found in Shopify Storefront API. Full Data: ' + JSON.stringify(rawResponse.data));
        return [];
      }

      this.logger.log(`Found ${menu.items?.length || 0} top-level menu items.`);

      const extractHandle = (url: string, title: string): string => {
        // Log URL to see what we are dealing with
        const match = url.match(/\/collections\/([^/?#]+)/);
        const handle = match ? match[1] : '';
        if (handle) {
           this.logger.log(`Extracted handle "${handle}" from URL "${url}"`);
        } else if (url.includes('/collections/')) {
           this.logger.warn(`Failed to extract handle from collection URL: "${url}"`);
        }
        return handle;
      };

      const categories = (menu.items || [])
        .map((item: any) => {
          const handle = extractHandle(item.url, item.title);
          const children = (item.items ?? [])
            .map((child: any) => ({
              title: child.title,
              handle: extractHandle(child.url, child.title),
              url: child.url,
            }))
            .filter((child: any) => child.handle !== '');

          return {
            title: item.title,
            handle,
            url: item.url,
            children
          };
        })
        .filter((cat: any) => cat.handle !== '' || cat.children.length > 0);

      this.logger.log(`Final categories count: ${categories.length}`);
      this.categoryCache = { data: categories, timestamp: now };
      return categories;
    } catch (error: any) {
      this.logger.error(`Failed to fetch categories: ${error.message}`);
      return this.categoryCache?.data || [];
    }
  }

 async fetchProductsPage(cursor: string | null): Promise<{
  products: ShopifyProductSyncPayload[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  if (!this.storeDomain || !this.accessToken) {
    throw new Error('Shopify credentials are not configured.');
  }

  const response = await firstValueFrom(
    this.httpService.post(
      this.apiUrl,
      { query: GET_PRODUCTS_QUERY, variables: { cursor } },
      {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      },
    ),
  );

  const parsedData = response.data;
  if (parsedData.errors?.length > 0) {
    throw new Error('Shopify API Error');
  }

  const productsPage = parsedData.data?.products;
  if (!productsPage) return { products: [], hasNextPage: false, endCursor: null };

  const products = productsPage.edges.map((e: any) =>
    ShopifyMapper.mapNodeToProductPayload(e.node),
  );

  return {
    products,
    hasNextPage: productsPage.pageInfo.hasNextPage,
    endCursor: productsPage.pageInfo.endCursor,
  };
}
async fetchProductsCount(): Promise<number> {
  const response = await firstValueFrom(
    this.httpService.post(
      this.apiUrl,
      { query: COUNT_QUERY },
      {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      },
    ),
  );

  return response.data?.data?.productsCount?.count ?? 0;
}
}
