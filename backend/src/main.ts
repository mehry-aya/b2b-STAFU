import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(3001);
  console.log('STAFUPRO API running on http://localhost:3001');
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
