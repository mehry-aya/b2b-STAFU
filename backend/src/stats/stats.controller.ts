import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('admin')
  @Roles(Role.admin, Role.master_admin)
  getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('dealer')
  @Roles(Role.dealer)
  getDealerStats(@CurrentUser() user: any) {
    return this.statsService.getDealerStats(user.dealer.id);
  }
}
