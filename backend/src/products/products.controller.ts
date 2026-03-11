import { Controller, Post, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(Role.master_admin, Role.admin)
  async syncProducts() {
    return this.productsService.syncFromShopify();
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

@Get()
async getProducts(
  @Query('search') search?: string,
  @Query('productType') productType?: string,
  @Query('category') category?: string,
  @Query('all') all?: string,
  @Query('inStock') inStock?: string,
  @CurrentUser() user?: any,
) {
  const isAdmin = user?.role === Role.admin || user?.role === Role.master_admin;
  const allStatuses = isAdmin && all === 'true';
  const inStockOnly = inStock === 'true';
  
  return await this.productsService.getActiveProducts(
    search,
    productType,
    allStatuses,
    category,
    inStockOnly
  );
}

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productsService.getProductById(id);
    } catch (error: any) {
      console.error('[ProductsController] getProduct error:', error.message);
      throw error;
    }
  }
}
