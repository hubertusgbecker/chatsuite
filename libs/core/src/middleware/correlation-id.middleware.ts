import { randomUUID } from 'node:crypto';
import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Header name used for request correlation. */
export const CORRELATION_ID_HEADER = 'x-correlation-id';

/**
 * Middleware that attaches a correlation ID to every request.
 * If the client sends one via the x-correlation-id header, it is reused;
 * otherwise a new UUID v4 is generated.
 *
 * The correlation ID is echoed back in the response headers.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) || randomUUID();
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
