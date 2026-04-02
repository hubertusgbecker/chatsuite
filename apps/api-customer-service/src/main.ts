/**
 * ChatSuite API Customer Service entry point.
 *
 * Configures and starts the NestJS application with global
 * exception handling, validation, and security middleware.
 */

import 'reflect-metadata';

import { randomUUID } from 'node:crypto';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app/app.module';
import { GlobalExceptionFilter } from './app/global-exception.filter';
import { CORRELATION_ID_HEADER } from './app/middleware/correlation-id.middleware';

/**
 * Configures the NestJS application with global middleware.
 * Extracted so tests can reuse the same configuration.
 *
 * @param app - The NestJS application instance to configure
 */
// biome-ignore lint/suspicious/noExplicitAny: NestJS app instance has no typed interface
export function configureApp(app: any): void {
  // Correlation-ID middleware (runs before all routes, including 404s)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  });

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}/api`);
}

// Bootstrap when run directly or via Nx node executor
const isDirectRun = require.main === module;
const isNxServe = process.env.NX_TASK_TARGET_TARGET === 'serve';
if (isDirectRun || isNxServe) {
  void bootstrap();
}
