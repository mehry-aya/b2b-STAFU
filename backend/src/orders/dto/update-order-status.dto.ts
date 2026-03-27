import { IsEnum, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsOptional()
  @IsNumber()
  paymentAmount?: number;
}
