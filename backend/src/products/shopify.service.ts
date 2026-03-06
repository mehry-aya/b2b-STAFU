import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface ShopifyProductSyncPayload {
  shopifyId: string;
  title: string;
  description: string | null;
  handle: string | null;
  vendor: string | null;
  productType: string | null;
  status: string;
  images: any[];
  variants: ShopifyVariantSyncPayload[];
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

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.storeDomain = this.configService.get<string>('SHOPIFY_STORE_URL') || '';
    this.accessToken = this.configService.get<string>('SHOPIFY_ADMIN_API_TOKEN') || '';
    const cleanDomain = this.storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.apiUrl = `https://${cleanDomain}/admin/api/2026-01/graphql.json`;
  }

  async fetchAllProducts(): Promise<ShopifyProductSyncPayload[]> {
    if (!this.storeDomain || !this.accessToken) {
      throw new Error('Shopify credentials are not configured.');
    }

    let hasNextPage = true;
    let cursor: string | null = null;
    const allProducts: ShopifyProductSyncPayload[] = [];

    const query = `
      query getProducts($cursor: String) {
        products(first: 50, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              descriptionHtml
              handle
              vendor
              productType
              status
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    while (hasNextPage) {
      this.logger.log(`Fetching page of Shopify products... cursor: ${cursor}`);
      
      const response = await firstValueFrom(
        this.httpService.post(
          this.apiUrl,
          {
            query,
            variables: { cursor },
          },
          {
            headers: {
              'X-Shopify-Access-Token': this.accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const parsedData = response.data;
      if (parsedData.errors && parsedData.errors.length > 0) {
        this.logger.error(`Shopify API Error: ${JSON.stringify(parsedData.errors)}`);
        throw new Error('Shopify API Error');
      }

      const productsPage = parsedData.data?.products;
      if (!productsPage) {
        break;
      }

      const nodes = productsPage.edges.map((e: any) => e.node);
      
      for (const node of nodes) {
        const variants = node.variants?.edges?.map((ve: any) => {
          const v = ve.node;
          const options = v.selectedOptions || [];
          return {
            shopifyVariantId: v.id,
            title: v.title,
            sku: v.sku,
            price: v.price || null,
            compareAtPrice: v.compareAtPrice || null,
            inventoryQuantity: v.inventoryQuantity ?? 0,
            option1: options[0]?.value || null,
            option2: options[1]?.value || null,
            option3: options[2]?.value || null,
            imageUrl: v.image?.url || null,
          };
        });

        const images = node.images?.edges?.map((ie: any) => ({
          src: ie.node.url,
          alt: ie.node.altText || '',
        })) || [];

        allProducts.push({
          shopifyId: node.id,
          title: node.title,
          description: node.descriptionHtml,
          handle: node.handle,
          vendor: node.vendor,
          productType: node.productType,
          status: node.status?.toLowerCase() || 'unknown',
          images,
          variants: variants || [],
        });
      }

      hasNextPage = productsPage.pageInfo.hasNextPage;
      cursor = productsPage.pageInfo.endCursor;
    }

    this.logger.log(`Fetched total ${allProducts.length} products from Shopify.`);
    return allProducts;
  }
}
