import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Body,
  Query,
} from '@nestjs/common';
import { DealersService } from './dealers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ContractStatus } from '@prisma/client';

@Controller('dealers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Get('admin/list')
  @Roles(Role.admin, Role.master_admin)
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.dealersService.findAll(Number(page), Number(limit));
  }

  @Patch('admin/:id/status')
  @Roles(Role.admin, Role.master_admin)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ContractStatus,
  ) {
    return this.dealersService.updateStatus(id, status);
  }
}
