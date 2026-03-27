import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Res,
  Query,
  Headers,
  Delete,
} from '@nestjs/common';
import * as express from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.dealer)
  async create(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(user.dealer.id, createOrderDto);
  }

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    if (user.role === Role.dealer) {
      return this.ordersService.findAll(Number(page), Number(limit), user.dealer.id);
    }
    // For admins, exclude drafts by default
    return this.ordersService.findAll(Number(page), Number(limit), undefined, true);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    if (user.role === Role.dealer) {
      return this.ordersService.remove(id, user.dealer.id);
    }
    return this.ordersService.remove(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Headers('x-lang') lang: string = 'tr',
  ) {
    if (user.role === Role.dealer) {
      return this.ordersService.findOne(id, user.dealer.id, lang);
    }
    return this.ordersService.findOne(id, undefined, lang);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ) {
    // For now, dealers can only update to 'pending_payment' (Submit for Payment)
    // Admins can change to anything.
    if (user.role === Role.dealer) {
      const order = await this.ordersService.findOne(id, user.dealer.id);
      
      const allowedTransitions: Record<string, string[]> = {
        'draft': ['pending_half_payment'],
        'pending_half_payment': ['half_payment_received'],
        'shipped': ['received'],
        'received': ['pending_rest_payment']
      };

      const currentStatus = order.status;
      const targetStatus = updateOrderStatusDto.status;

      if (!allowedTransitions[currentStatus]?.includes(targetStatus)) {
        throw new Error(`Unauthorized status transition from ${currentStatus} to ${targetStatus}`);
      }
    }

    return this.ordersService.updateStatus(id, updateOrderStatusDto.status, user.email);
  }

  @Get('export/excel')
  @Roles(Role.admin, Role.master_admin)
  async exportOrders(
    @Res() res: express.Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    const buffer = await this.ordersService.exportOrdersToExcel(
      startDate,
      endDate,
      status as any,
    );

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
