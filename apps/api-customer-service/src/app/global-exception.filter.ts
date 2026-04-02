import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CORRELATION_ID_HEADER } from './middleware/correlation-id.middleware';
import { BusinessException, ErrorCode } from './exceptions';
import type { ErrorResponseBody } from './exceptions';

/**
 * Global exception filter that catches all unhandled exceptions
 * and returns a standardized error response format.
 *
 * Includes error codes, correlation IDs, and field-level validation
 * details when available.
 *
 * @throws Never -- this filter catches all exceptions
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers[CORRELATION_ID_HEADER] as
      | string
      | undefined;

    // Determine status: HttpException > Express native errors (status/statusCode) > 500
    const isExpressError =
      !(exception instanceof HttpException) &&
      exception instanceof Error &&
      ('status' in exception || 'statusCode' in exception);

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : isExpressError
          ? ((exception as Error & { status?: number; statusCode?: number })
              .status ??
            (exception as Error & { status?: number; statusCode?: number })
              .statusCode ??
            HttpStatus.INTERNAL_SERVER_ERROR)
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorCode =
      exception instanceof BusinessException
        ? exception.errorCode
        : this.mapStatusToErrorCode(statusCode);

    // Only expose messages from known exception types.
    // Express native errors (e.g. "Cannot GET /path") are safe to expose.
    // Unknown errors get a generic message to avoid leaking internals.
    const message =
      exception instanceof HttpException
        ? exception.message
        : isExpressError
          ? (exception as Error).message
          : 'Internal server error';

    const details =
      exception instanceof BusinessException ? exception.details : undefined;

    this.logger.error(
      `[${correlationId ?? 'no-id'}] ${request.method} ${
        request.url
      } ${statusCode}: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const body: ErrorResponseBody = {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(correlationId && { correlationId }),
      ...(details && { details }),
    };

    response.status(statusCode).json(body);
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case 400:
        return ErrorCode.BAD_REQUEST;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 409:
        return ErrorCode.CONFLICT;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }
}
