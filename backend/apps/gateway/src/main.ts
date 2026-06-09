import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { join } from 'path';
import * as express from 'express';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  
  // Enable CORS for frontend API requests
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Ensure the uploads directory exists
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve the uploads folder statically at http://localhost:3000/uploads/...
  app.use('/uploads', express.static(uploadsDir));

  // Register validation pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Gateway is running on: http://localhost:${port}`);
}
bootstrap();
