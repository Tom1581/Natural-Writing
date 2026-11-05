import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { corsOptions } from './cors';

async function bootstrap() {
  // rawBody: true is required so Stripe webhook signature verification works
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  app.enableCors(corsOptions());

  await app.listen(port);
}
bootstrap();
