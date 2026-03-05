import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
