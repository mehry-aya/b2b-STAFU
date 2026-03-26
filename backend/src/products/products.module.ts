import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ShopifyWebhookController } from './shopify-webhook.controller';
import { ShopifyService } from './shopify.service';
import { SyncStatusService } from './sync-status.service';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [ProductsController, ShopifyWebhookController],
  providers: [ProductsService, ShopifyService, SyncStatusService],
  exports: [SyncStatusService],
})
export class ProductsModule {}
