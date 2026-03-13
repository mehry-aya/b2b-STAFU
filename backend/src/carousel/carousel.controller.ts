import { Controller, Get, Query } from '@nestjs/common';
import { CarouselService } from './carousel.service';

@Controller('carousel-images')
export class CarouselController {
  constructor(private readonly carouselService: CarouselService) {}

  @Get()
  async getCarouselImages(@Query('page') page: string) {
    if (!page) {
      return [];
    }
    return this.carouselService.getCarouselImages();
  }
}
