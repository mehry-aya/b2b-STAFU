import { Controller, Post, Get, Param, Query, UseGuards, ParseIntPipe, Logger, Headers } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SyncStatusService } from './sync-status.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    private readonly logger = new Logger(ProductsController.name);

  constructor(
    private readonly productsService: ProductsService,
    private readonly syncStatusService: SyncStatusService,
  ) {}

  @Post('sync')
@UseGuards(RolesGuard)
@Roles(Role.master_admin, Role.admin)
async syncProducts() {
  // Don't await — let it run in the background
  this.productsService.syncFromShopify().catch((err) => {
    this.logger.error('Background sync failed:', err.message);
  });

  return { message: 'Sync started' };
}

  @Get('sync/status')
  @UseGuards(RolesGuard)
  @Roles(Role.master_admin, Role.admin)
  async getSyncStatus() {
    return this.syncStatusService.getStatus();
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
    @Query('status') status?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Headers('x-lang') lang: string = 'tr',
    @CurrentUser() user?: any,
  ) {
    const isAdmin = user?.role === Role.admin || user?.role === Role.master_admin;
    const allStatuses = isAdmin && all === 'true';
    const inStockOnly = inStock === 'true';
    
    return await this.productsService.getProducts(
      search,
      productType,
      allStatuses,
      category,
      inStockOnly,
      status,
      parseInt(page, 10),
      parseInt(limit, 10),
      lang
    );
  }

  @Get(':id')
  async getProduct(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-lang') lang: string = 'tr',
  ) {
    try {
      return await this.productsService.getProductById(id, lang);
    } catch (error: any) {
      console.error('[ProductsController] getProduct error:', error.message);
      throw error;
    }
  }
}
