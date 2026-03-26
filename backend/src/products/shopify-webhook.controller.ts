import { Controller, Post, Headers, Body, Logger, HttpCode } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('webhooks/shopify')
export class ShopifyWebhookController {
  private readonly logger = new Logger(ShopifyWebhookController.name);

  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-shopify-topic') topic: string,
    @Body() payload: any
  ) {
    this.logger.log(`Received Shopify webhook: ${topic}`);
    
    if (!topic) return { status: 'ignored' };

    try {
      if (topic === 'products/update' || topic === 'products/create') {
        await this.productsService.syncProductFromWebhook(payload);
      } else if (topic === 'products/delete') {
        await this.productsService.deleteProductByShopifyId(payload.id?.toString());
      }
    } catch (error: any) {
      this.logger.error(`Error processing webhook ${topic}: ${error.message}`);
    }

    return { status: 'success' };
  }
}
