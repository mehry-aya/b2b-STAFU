import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CarouselService } from './carousel.service';
import { CarouselController } from './carousel.controller';

@Module({
  imports: [HttpModule],
  providers: [CarouselService],
  controllers: [CarouselController],
  exports: [CarouselService],
})
export class CarouselModule {}
