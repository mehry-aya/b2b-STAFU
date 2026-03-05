import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('master_admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Post('create-admin')
  @Roles('master_admin')
  createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Get('admins')
  @Roles('master_admin')
  findAllAdmins() {
    return this.usersService.findAllAdmins();
  }

  @Delete(':id')
  @Roles('master_admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
