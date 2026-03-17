import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, ContractStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateContractStatusDto } from './dto/update-contract-status.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('upload')
  @Roles(Role.dealer)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/contracts',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadContract(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    // Assuming user object has dealerId for dealer role
    const dealerId = user.dealerId;
    if (!dealerId) {
      throw new ForbiddenException('Only dealers can upload contracts');
    }
    return this.contractsService.create(
      dealerId,
      file.originalname,
      `/uploads/contracts/${file.filename}`,
      file.mimetype.includes('pdf') ? 'PDF' : 'Image',
    );
  }

  @Get('my-contracts')
  @Roles(Role.dealer)
  async getMyContracts(@CurrentUser() user: any) {
    const dealerId = user.dealerId;
    if (!dealerId) {
      throw new ForbiddenException('Dealer account not found');
    }
    return this.contractsService.findByDealer(dealerId);
  }

  @Get('admin/list')
  @Roles(Role.admin, Role.master_admin)
  async findAll(@Query('status') status?: ContractStatus) {
    return this.contractsService.findAllAdmin(status);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/review')
  @Roles(Role.admin, Role.master_admin)
  async review(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateContractStatusDto,
  ) {
    return this.contractsService.updateStatus(id, updateDto.status, updateDto.notes);
  }
}
