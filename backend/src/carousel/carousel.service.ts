import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GET_AUTH_CAROUSEL_QUERY } from '../shopify/shopify-queries';

@Injectable()
export class CarouselService {
  private readonly logger = new Logger(CarouselService.name);
  private readonly storefrontAccessToken: string;
  private readonly storefrontApiUrl: string;

  private cache: Map<string, { images: string[]; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 3600 * 1000; // 1 hour

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const storeDomain = this.configService.get<string>('SHOPIFY_STORE_URL') || '';
    this.storefrontAccessToken = this.configService.get<string>('SHOPIFY_STOREFRONT_ACCESS_TOKEN') || '';
    
    const cleanDomain = storeDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.storefrontApiUrl = `https://${cleanDomain}/api/2025-01/graphql.json`;
  }

  async getCarouselImages(): Promise<string[]> {
  const cached = this.cache.get('carousel');
  if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
    return cached.images;
  }

  try {
    const response = await firstValueFrom(
      this.httpService.post(
        this.storefrontApiUrl,
        {
          query: GET_AUTH_CAROUSEL_QUERY,
          variables: { type: 'login_carousel' },
        },
        {
          headers: {
            'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    const metaobjects = response.data?.data?.metaobjects?.edges || [];
    const images: string[] = [];
// this.logger.debug(JSON.stringify(response.data?.data, null, 2));
    for (const edge of metaobjects) {
      const fields = edge.node.fields;
      const isActive = fields.find((f: any) => f.key === 'is_active')?.value === 'true';
      if (!isActive) continue;

      const imageRefs = fields.find((f: any) => f.key === 'images')?.references?.edges || [];
      for (const ref of imageRefs) {
        if (ref.node?.image?.url) images.push(ref.node.image.url);
      }
    }

    this.cache.set('carousel', { images, timestamp: Date.now() });
    return images;
  } catch (error: any) {
    this.logger.error(`Failed to fetch carousel images: ${error.message}`);
    return [];
  }
  
}
}
