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
    // Note: In a real app, you'd lookup the dealerId from the user.id
    // Assuming user.dealer.id is available via auth strategy profile
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
    return this.ordersService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    if (user.role === Role.dealer) {
      return this.ordersService.findOne(id, user.dealer.id);
    }
    return this.ordersService.findOne(id);
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
      if (order.status !== 'draft') {
        throw new Error('Only draft orders can be submitted for payment');
      }
      if (updateOrderStatusDto.status !== 'pending_payment') {
        throw new Error('Dealers can only submit orders for payment');
      }
    }

    return this.ordersService.updateStatus(id, updateOrderStatusDto.status);
  }

  @Get('export/excel')
  @Roles(Role.admin, Role.master_admin)
  async exportOrders(@Res() res: express.Response) {
    const buffer = await this.ordersService.exportOrdersToExcel();

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="orders-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
