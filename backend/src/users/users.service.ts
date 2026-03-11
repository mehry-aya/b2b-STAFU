import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: number, role: string, dto: UpdateProfileDto) {
    const updateData: any = {};

    if (dto.password) {
      if (!dto.oldPassword) {
        throw new BadRequestException('Old password is required to set a new password');
      }

      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(dto.oldPassword, currentUser.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect old password');
      }

      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    if (role === 'dealer' && (dto.companyName || dto.phone !== undefined || dto.address !== undefined)) {
      updateData.dealer = {
        update: {},
      };
      if (dto.companyName) updateData.dealer.update.companyName = dto.companyName;
      if (dto.phone !== undefined) updateData.dealer.update.phone = dto.phone;
      if (dto.address !== undefined) updateData.dealer.update.address = dto.address;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        dealer: {
          select: {
            companyName: true,
            phone: true,
            address: true,
          },
        },
      },
    });
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createAdminDto.email },
    });

    if (existingUser) {
      throw new ForbiddenException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);

    return this.prisma.user.create({
      data: {
        email: createAdminDto.email,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        dealer: {
          select: {
            companyName: true,
            phone: true,
          },
        },
      },
    });
  }

  async findAllAdmins() {
    return this.prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if ((user.role as string) === 'master_admin') {
      throw new ForbiddenException('Cannot delete a master_admin account');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
