import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus } from '@prisma/client';

@Injectable()
export class DealersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dealer.findMany({
      include: {
        user: {
          select: {
            email: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(dealerId: number, status: ContractStatus) {
    const dealer = await this.prisma.dealer.findUnique({
      where: { id: dealerId },
    });
    if (!dealer) throw new NotFoundException('Dealer not found');

    // If approved, we also activate the user account
    const updatedDealer = await this.prisma.dealer.update({
      where: { id: dealerId },
      data: { contractStatus: status },
    });

    return updatedDealer;
  }
}
