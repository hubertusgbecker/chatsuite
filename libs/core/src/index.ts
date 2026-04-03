// Bootstrap
export { configureApp } from './bootstrap';

// DTOs
export { HealthResponseDto, WelcomeResponseDto } from './dto';

// Exceptions
export type { ErrorResponseBody, ValidationDetail } from './exceptions';
export {
  BusinessException,
  ConflictException,
  ErrorCode,
  ResourceNotFoundException,
  ServiceUnavailableException,
  ValidationException,
} from './exceptions';

// Filters
export { GlobalExceptionFilter } from './filters';

// Middleware
export { CORRELATION_ID_HEADER, CorrelationIdMiddleware } from './middleware';
