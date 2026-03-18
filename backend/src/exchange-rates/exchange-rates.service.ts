import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ExchangeRatesService implements OnModuleInit {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private readonly apiUrl = 'https://open.er-api.com/v6/latest/TRY';

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async onModuleInit() {
    // Ensure we have initial rates on startup if DB is empty
    const count = await this.prisma.exchangeRate.count();
    if (count === 0) {
      this.logger.log('No exchange rates found in DB. Initializing...');
      await this.updateRates();
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateRates() {
    try {
      this.logger.log('Fetching live exchange rates from TRY base...');
      const response = await lastValueFrom(this.httpService.get(this.apiUrl));
      const rates = response.data.rates;

      if (!rates) {
        throw new Error('Invalid response from exchange rate API');
      }

      const targetCurrencies = ['USD', 'EUR', 'TRY'];

      for (const code of targetCurrencies) {
        const rateValue = rates[code];
        if (rateValue !== undefined) {
          await this.prisma.exchangeRate.upsert({
            where: { code },
            update: { rate: rateValue, updatedAt: new Date() },
            create: { code, rate: rateValue },
          });
        }
      }

      this.logger.log('Exchange rates updated successfully.');
    } catch (error) {
      this.logger.error('Failed to update exchange rates:', error.message);
      // Stale rate fallback is implicit because we keep the old rates in the DB.
    }
  }

  async getRates() {
    try {
      const rates = await this.prisma.exchangeRate.findMany();
      if (rates.length === 0) {
        // This shouldn't normally happen because of onModuleInit, but as a safety:
        await this.updateRates();
        return this.prisma.exchangeRate.findMany();
      }
      return rates;
    } catch (error) {
      this.logger.error('Error fetching rates from DB:', error.message);
      throw error;
    }
  }
}
