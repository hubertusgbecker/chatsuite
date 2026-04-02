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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getData', () => {
    it('should return welcome message object with message key', () => {
      const result = controller.getData();
      expect(result).toEqual({
        message: 'Welcome to api-customer-service of ChatSuite!',
      });
    });

    it('should delegate to AppService', () => {
      const spy = vi.spyOn(service, 'getData');
      controller.getData();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should propagate service errors', () => {
      vi.spyOn(service, 'getData').mockImplementation(() => {
        throw new Error('Service failure');
      });
      expect(() => controller.getData()).toThrow('Service failure');
    });

    it('should return the same result on consecutive calls', () => {
      const first = controller.getData();
      const second = controller.getData();
      expect(first).toEqual(second);
    });

    it('should return an object with exactly one key', () => {
      const result = controller.getData();
      expect(Object.keys(result)).toEqual(['message']);
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
      expect(Number.isNaN(parsed)).toBe(false);
      // Timestamp should be within last 2 seconds
      expect(Date.now() - parsed).toBeLessThan(2000);
    });

    it('should return version from env or fallback to 0.0.0', () => {
      const result = controller.getHealth();
      expect(result.version).toMatch(/^\d+\.\d+\.\d+/);
    });

    it('should use npm_package_version when available', () => {
      const original = process.env.npm_package_version;
      process.env.npm_package_version = '9.8.7';
      try {
        const result = controller.getHealth();
        expect(result.version).toBe('9.8.7');
      } finally {
        process.env.npm_package_version = original;
      }
    });

    it('should fallback to 0.0.0 when npm_package_version is not set', () => {
      const original = process.env.npm_package_version;
      delete process.env.npm_package_version;
      try {
        const result = controller.getHealth();
        expect(result.version).toBe('0.0.0');
      } finally {
        process.env.npm_package_version = original;
      }
    });

    it('should return exactly four keys in health response', () => {
      const result = controller.getHealth();
      expect(Object.keys(result).sort()).toEqual(['status', 'timestamp', 'uptime', 'version']);
    });

    it('should return unique timestamps on consecutive calls', async () => {
      const first = controller.getHealth();
      await new Promise((resolve) => setTimeout(resolve, 5));
      const second = controller.getHealth();
      const t1 = Date.parse(first.timestamp);
      const t2 = Date.parse(second.timestamp);
      expect(t2).toBeGreaterThanOrEqual(t1);
    });
  });
});
