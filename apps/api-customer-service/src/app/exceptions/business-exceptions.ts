import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

/**
 * Standardized error response shape returned by all exceptions.
 */
export interface ErrorResponseBody {
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  timestamp: string;
  path: string;
  correlationId?: string;
  details?: ValidationDetail[];
}

/**
 * Field-level validation error detail.
 */
export interface ValidationDetail {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Base business exception with error code support.
 */
export class BusinessException extends HttpException {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    status: HttpStatus,
    public readonly details?: ValidationDetail[]
  ) {
    super({ errorCode, message, details }, status);
  }
}

/**
 * Thrown when a requested resource does not exist.
 *
 * @param resource - Name of the resource type (e.g. "User", "Project")
 * @param identifier - The lookup value that was not found
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier: string | number) {
    super(
      ErrorCode.NOT_FOUND,
      `${resource} not found: ${identifier}`,
      HttpStatus.NOT_FOUND
    );
  }
}

/**
 * Thrown when input validation fails with field-level details.
 */
export class ValidationException extends BusinessException {
  constructor(details: ValidationDetail[]) {
    super(
      ErrorCode.VALIDATION_FAILED,
      'Validation failed',
      HttpStatus.BAD_REQUEST,
      details
    );
  }
}

/**
 * Thrown when a create/update would violate a uniqueness constraint.
 */
export class ConflictException extends BusinessException {
  constructor(resource: string, field: string) {
    super(
      ErrorCode.CONFLICT,
      `${resource} with this ${field} already exists`,
      HttpStatus.CONFLICT
    );
  }
}

/**
 * Thrown when an external service is unreachable or times out.
 */
export class ServiceUnavailableException extends BusinessException {
  constructor(service: string) {
    super(
      ErrorCode.SERVICE_UNAVAILABLE,
      `${service} is currently unavailable`,
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}
