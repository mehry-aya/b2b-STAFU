import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContractStatus } from '@prisma/client';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(dealerId: number, fileName: string, fileUrl: string, type: string) {
    return this.prisma.contract.create({
      data: {
        dealerId,
        fileName,
        fileUrl,
        type,
        status: ContractStatus.pending,
      },
    });
  }

  async findByDealer(dealerId: number) {
    return this.prisma.contract.findMany({
      where: { dealerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(status?: ContractStatus) {
    return this.prisma.contract.findMany({
      where: status ? { status } : {},
      include: {
        dealer: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: number, status: ContractStatus, notes?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: {
        status,
        notes,
      },
    });

    // If approved, optionally update the dealer's main contract status
    if (status === ContractStatus.approved) {
        await this.prisma.dealer.update({
            where: { id: contract.dealerId },
            data: {
                contractStatus: ContractStatus.approved,
                contractUrl: contract.fileUrl
            }
        });
    }

    return updatedContract;
  }

  async findOne(id: number) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        dealer: true,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }
}
