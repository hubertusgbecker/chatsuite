/**
 * Health check response DTO.
 */
export class HealthResponseDto {
  /** Service status indicator. Always 'ok' when healthy. */
  status!: string;

  /** ISO 8601 timestamp of when health was checked. */
  timestamp!: string;

  /** Application semantic version. */
  version!: string;

  /** Process uptime in seconds. */
  uptime!: number;
}

/**
 * Welcome/root endpoint response DTO.
 */
export class WelcomeResponseDto {
  /** Welcome message string. */
  message!: string;
}
