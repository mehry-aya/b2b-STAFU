import { Controller, Get } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  async getRates() {
    const rates = await this.exchangeRatesService.getRates();
    // Return as a simple object for easier frontend consumption
    return rates.reduce((acc, curr) => {
      acc[curr.code] = Number(curr.rate);
      return acc;
    }, {} as Record<string, number>);
  }
}
