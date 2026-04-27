import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';

async function bootstrap() {
  // rawBody: true is required so Stripe webhook signature verification works
  const app = await NestFactory.create(AppModule, { rawBody: true });
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  // Security headers — blocks XSS, clickjacking, MIME sniffing, etc.
  app.use(helmet());

  app.enableCors({
    origin: [
      'https://naturalquill.one',
      'https://www.naturalquill.one',
      /\.naturalquill\.one$/,
      // Allow localhost for local dev
      /^http:\/\/localhost:\d+$/,
    ],
    credentials: true,
  });

  await app.listen(port);
}
bootstrap();
