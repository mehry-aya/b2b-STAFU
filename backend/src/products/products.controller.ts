import { Controller, Post, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(Role.master_admin, Role.admin)
  async syncProducts() {
    return this.productsService.syncFromShopify();
  }

  @Get()
  async getProducts(
    @Query('search') search?: string,
    @Query('productType') productType?: string,
  ) {
    return this.productsService.getActiveProducts(search, productType);
  }

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }
}
