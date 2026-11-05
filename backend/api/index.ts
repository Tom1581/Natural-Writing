import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { corsOptions } from '../src/cors';

let cachedServer: express.Express | null = null;

async function createServer() {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    rawBody: true,
  });

  app.enableCors(corsOptions());

  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await createServer();
  return server(req, res);
}
