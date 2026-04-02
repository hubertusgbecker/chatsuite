import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import {
  BusinessException,
  ErrorCode,
  ValidationException,
} from './exceptions';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockRequest: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {},
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should return 500 for unknown exceptions', () => {
    filter.catch(new Error('unexpected'), mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      })
    );
  });

  it('should preserve HttpException status code', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        errorCode: ErrorCode.FORBIDDEN,
        message: 'Forbidden',
      })
    );
  });

  it('should include errorCode from BusinessException', () => {
    const exception = new BusinessException(
      ErrorCode.DB_QUERY_FAILED,
      'query failed',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
    filter.catch(exception, mockHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: ErrorCode.DB_QUERY_FAILED,
      })
    );
  });

  it('should include validation details when present', () => {
    const exception = new ValidationException([
      { field: 'email', message: 'Invalid email format' },
    ]);
    filter.catch(exception, mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
    expect(body.details).toEqual([
      { field: 'email', message: 'Invalid email format' },
    ]);
  });

  it('should include correlation-id when present in request', () => {
    mockRequest.headers['x-correlation-id'] = 'test-corr-123';
    filter.catch(new Error('test'), mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.correlationId).toBe('test-corr-123');
  });

  it('should omit correlation-id when not present in request', () => {
    filter.catch(new Error('test'), mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.correlationId).toBeUndefined();
  });

  it('should include timestamp and path in all responses', () => {
    filter.catch(new Error('test'), mockHost);

    const body = mockResponse.json.mock.calls[0][0];
    expect(body.path).toBe('/api/test');
    expect(Date.parse(body.timestamp)).not.toBeNaN();
  });

  it('should not expose stack traces in response body', () => {
    filter.catch(new Error('secret details'), mockHost);

    const bodyStr = JSON.stringify(mockResponse.json.mock.calls[0][0]);
    expect(bodyStr).not.toContain('at ');
    expect(bodyStr).not.toContain('.ts:');
  });

  it('should handle non-Error exceptions gracefully', () => {
    filter.catch('string error', mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      })
    );
  });
});
