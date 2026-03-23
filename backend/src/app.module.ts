import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DealersModule } from './dealers/dealers.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CarouselModule } from './carousel/carousel.module';
import { StatsModule } from './stats/stats.module';
import { ContractsModule } from './contracts/contracts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { ShopifyModule } from './shopify/shopify.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    DealersModule,
    ProductsModule,
    OrdersModule,
    CarouselModule,
    StatsModule,
    ContractsModule,
    ScheduleModule.forRoot(),
    ExchangeRatesModule,
    ShopifyModule,
  ],

})
export class AppModule {}
