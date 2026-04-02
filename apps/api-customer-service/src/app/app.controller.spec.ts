import { Test, type TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return welcome message object with message key', () => {
      const result = controller.getData();
      expect(result).toEqual({
        message: 'Welcome to api-customer-service of ChatSuite!',
      });
    });

    it('should delegate to AppService', () => {
      const spy = jest.spyOn(service, 'getData');
      controller.getData();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', () => {
      jest.spyOn(service, 'getData').mockImplementation(() => {
        throw new Error('Service failure');
      });
      expect(() => controller.getData()).toThrow('Service failure');
    });
  });

  describe('getHealth', () => {
    it('should return health response with all required fields', () => {
      const result = controller.getHealth();
      expect(result.status).toBe('ok');
      expect(result.version).toBeDefined();
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should return a valid ISO 8601 timestamp', () => {
      const result = controller.getHealth();
      const parsed = Date.parse(result.timestamp);
      expect(isNaN(parsed)).toBe(false);
      // Timestamp should be within last 2 seconds
      expect(Date.now() - parsed).toBeLessThan(2000);
    });

    it('should return version from env or fallback to 0.0.0', () => {
      const result = controller.getHealth();
      expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });
});
