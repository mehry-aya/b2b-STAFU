import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, Role } from '@prisma/client';
import { startOfWeek, startOfMonth, startOfYear, subMonths, endOfDay } from 'date-fns';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const yearStart = startOfYear(now);
    
    // Include the entire day exactly 3 months ago by using endOfDay
    const threeMonthsAgo = endOfDay(subMonths(now, 3));

    const [
      weekRevenue,
      monthRevenue,
      yearRevenue,
      allTimeRevenue,
      totalDealers,
      activeDealers,
      totalAdmins,
      totalOrders,
      pendingContracts,
      pendingContractsCount,
      pendingOrdersCount,
      staleShipments,
    ] = await Promise.all([
      this.getRevenue(weekStart),
      this.getRevenue(monthStart),
      this.getRevenue(yearStart),
      this.getRevenue(),
      this.prisma.dealer.count(),
      this.prisma.user.count({ where: { role: Role.dealer, isActive: true } }),
      this.prisma.user.count({ where: { role: { in: [Role.admin, Role.master_admin] } } }),
      this.prisma.order.count({ where: { status: { not: OrderStatus.draft } } }),
      this.prisma.contract.findMany({
        where: { status: 'pending' },
        include: { 
          dealer: { 
            include: { user: { select: { email: true } } } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.contract.count({ where: { status: 'pending' } }),
      this.prisma.order.count({ where: { status: { in: [OrderStatus.pending_half_payment, OrderStatus.half_payment_received, OrderStatus.pending_rest_payment] } } }),
      this.prisma.order.findMany({
        where: { 
          status: OrderStatus.shipped,
          updatedAt: { lt: threeMonthsAgo }
        },
        include: { dealer: true },
        orderBy: { updatedAt: 'asc' },
        take: 10,
      }),
    ]);

    return {
      revenue: {
        week: weekRevenue,
        month: monthRevenue,
        year: yearRevenue,
        allTime: allTimeRevenue,
      },
      platform: {
        totalDealers,
        activeDealers,
        totalAdmins,
        totalOrders,
        pendingContractsCount,
      },
      alerts: {
        pendingContracts,
        pendingOrdersCount,
        staleShipments,
      },
    };
  }

  async getDealerStats(dealerId: number) {
    const [
      totalOrders,
      pendingOrders,
      totalSpent,
      recentContract,
      recentOrder,
    ] = await Promise.all([
      this.prisma.order.count({ where: { dealerId } }),
      this.prisma.order.count({ where: { dealerId, status: { in: [OrderStatus.pending_half_payment, OrderStatus.half_payment_received, OrderStatus.shipped, OrderStatus.received, OrderStatus.pending_rest_payment] } } }),
      this.prisma.order.aggregate({
        where: { dealerId, status: { in: [OrderStatus.paid, OrderStatus.shipped] } },
        _sum: { totalAmount: true },
      }),
      this.prisma.contract.findFirst({
        where: { dealerId },
        orderBy: { createdAt: 'desc' },
        select: { status: true },
      }),
      this.prisma.order.findFirst({
        where: { dealerId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalAmount: true,
          _count: { select: { items: true } },
        },
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      totalSpent: totalSpent._sum.totalAmount || 0,
      contractStatus: recentContract?.status || 'none',
      recentOrder: recentOrder ? {
        id: recentOrder.id,
        date: recentOrder.createdAt,
        itemsCount: recentOrder._count.items,
        total: recentOrder.totalAmount,
        status: recentOrder.status,
      } : null,
    };
  }

  private async getRevenue(startDate?: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        status: { in: [OrderStatus.paid, OrderStatus.shipped] },
        ...(startDate ? { createdAt: { gte: startDate } } : {}),
      },
      _sum: { totalAmount: true },
    });
    return result._sum.totalAmount || 0;
  }
}
