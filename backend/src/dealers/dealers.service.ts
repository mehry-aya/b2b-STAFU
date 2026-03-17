import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus } from '@prisma/client';

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.dealer.findMany({
        include: {
          user: {
            select: {
              email: true,
              isActive: true,
            },
          },
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dealer.count(),
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    };
  }

  async findOneAdmin(id: number) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
            createdAt: true,
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!dealer) throw new NotFoundException('Dealer not found');
    return dealer;
  }

  async updateStatus(dealerId: number, status: ContractStatus, adminEmail: string) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { id: dealerId },
    });
    if (!dealer) throw new NotFoundException('Dealer not found');

    // If approved, we also activate the user account. If rejected or suspended, we deactivate it.
    const updatedDealer = await this.prisma.dealer.update({
      where: { id: dealerId },
      data: { 
        contractStatus: status,
        statusChangedByEmail: adminEmail,
        statusChangedAt: new Date(),
        user: {
          update: {
            isActive: status === 'approved'
          }
        }
      } as any,
      include: {
        user: {
          select: {
            email: true,
            isActive: true
          }
        }
      }
    });

    return updatedDealer;
  }
}
