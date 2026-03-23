import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'https://b2b-stafu.vercel.app',
      'https://b2b-stafu-git-main-ayamehri293-4414s-projects.vercel.app',
      'https://b2b-stafu-production.up.railway.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = process.env.PORT || 3001;
  // Explicitly listen on '0.0.0.0' for Railway
  await app.listen(port, '0.0.0.0');
  console.log(`STAFUPRO API running on port ${port} (on 0.0.0.0)`);
}


bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});