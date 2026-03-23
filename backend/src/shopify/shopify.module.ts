import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyInventoryService } from './shopify-inventory.service';
import { ShopifyInventoryController } from './shopify-inventory.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, PrismaModule],
  controllers: [ShopifyInventoryController],
  providers: [ShopifyInventoryService],
  exports: [ShopifyInventoryService],
})
export class ShopifyModule {}
