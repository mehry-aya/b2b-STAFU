import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive && user.role !== 'dealer') {
      throw new ForbiddenException('Account is inactive');
    }

    return user;
  }

  login(user: { id: number; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        role: 'dealer',
        isActive: true,
        dealer: {
          create: {
            companyName: registerDto.companyName,
            phone: registerDto.phone,
          },
        },
      },
    });

    return { message: 'Account created successfully. You can now login.' };
  }

  async getProfile(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        email: true,
        role: true,
        dealer: {
          select: {
            companyName: true,
          },
        },
      },
    });
  }
}
