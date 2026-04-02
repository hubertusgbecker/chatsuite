import { HttpStatus } from '@nestjs/common';
import {
  BusinessException,
  ResourceNotFoundException,
  ValidationException,
  ConflictException,
  ServiceUnavailableException,
  ErrorCode,
} from './index';

describe('Business Exceptions', () => {
  describe('ResourceNotFoundException', () => {
    it('should create 404 exception with resource name and identifier', () => {
      const exception = new ResourceNotFoundException('User', 42);

      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.errorCode).toBe(ErrorCode.NOT_FOUND);
      expect(exception.message).toBe('User not found: 42');
    });

    it('should accept string identifiers', () => {
      const exception = new ResourceNotFoundException(
        'Project',
        'my-project-key',
      );
      expect(exception.message).toBe('Project not found: my-project-key');
    });
  });

  describe('ValidationException', () => {
    it('should create 400 exception with field-level details', () => {
      const details = [
        { field: 'email', message: 'Invalid format', value: 'not-an-email' },
        { field: 'name', message: 'Required' },
      ];
      const exception = new ValidationException(details);

      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.errorCode).toBe(ErrorCode.VALIDATION_FAILED);
      expect(exception.details).toHaveLength(2);
      expect(exception.details?.[0].field).toBe('email');
      expect(exception.details?.[0].value).toBe('not-an-email');
    });
  });

  describe('ConflictException', () => {
    it('should create 409 exception with resource and field', () => {
      const exception = new ConflictException('Account', 'email');

      expect(exception.getStatus()).toBe(HttpStatus.CONFLICT);
      expect(exception.errorCode).toBe(ErrorCode.CONFLICT);
      expect(exception.message).toBe('Account with this email already exists');
    });
  });

  describe('ServiceUnavailableException', () => {
    it('should create 503 exception with service name', () => {
      const exception = new ServiceUnavailableException('MindsDB');

      expect(exception.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(exception.errorCode).toBe(ErrorCode.SERVICE_UNAVAILABLE);
      expect(exception.message).toBe('MindsDB is currently unavailable');
    });
  });

  describe('BusinessException base', () => {
    it('should be an instance of HttpException', () => {
      const exception = new BusinessException(
        ErrorCode.INTERNAL_ERROR,
        'test',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(exception).toBeInstanceOf(BusinessException);
      expect(exception.getStatus()).toBe(500);
    });

    it('should support optional details', () => {
      const withDetails = new BusinessException(
        ErrorCode.BAD_REQUEST,
        'bad',
        HttpStatus.BAD_REQUEST,
        [{ field: 'x', message: 'y' }],
      );
      expect(withDetails.details).toHaveLength(1);

      const withoutDetails = new BusinessException(
        ErrorCode.BAD_REQUEST,
        'bad',
        HttpStatus.BAD_REQUEST,
      );
      expect(withoutDetails.details).toBeUndefined();
    });
  });
});
