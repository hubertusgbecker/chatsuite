import { randomUUID } from 'node:crypto';
import { ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { GlobalExceptionFilter } from '../filters/global-exception.filter';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware';

/**
 * Configures the NestJS application with global middleware.
 * Applies correlation-ID tracking, CORS, validation pipes, and
 * the global exception filter.
 *
 * Extracted so tests can reuse the same configuration.
 *
 * @param app - The NestJS application instance to configure
 * @param options - Optional configuration overrides
 * @param options.globalPrefix - Route prefix (default: 'api')
 */
// biome-ignore lint/suspicious/noExplicitAny: NestJS app instance has no typed interface
export function configureApp(app: any, options?: { globalPrefix?: string }): void {
  const prefix = options?.globalPrefix ?? 'api';

  // Correlation-ID middleware (runs before all routes, including 404s)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  });

  app.setGlobalPrefix(prefix);
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
