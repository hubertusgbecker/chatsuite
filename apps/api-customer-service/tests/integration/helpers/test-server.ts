import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../src/app/app.module';

let app: INestApplication | null = null;
let moduleRef: TestingModule | null = null;

/**
 * Creates and initializes a test NestJS application.
 * Reuses the same instance if already created for performance.
 *
 * @returns Initialized NestJS application
 */
export async function createTestServer(): Promise<INestApplication> {
  if (app) {
    return app;
  }

  try {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication() as INestApplication;

    // Apply same configuration as production
    // app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    app.enableCors();

    await app.init();
    console.log('✅ Test server initialized');
    return app;
  } catch (error) {
    console.error('❌ Failed to create test server:', error);
    throw error;
  }
}

/**
 * Closes the test NestJS application.
 * Should be called in global teardown.
 */
export async function closeTestServer(): Promise<void> {
  if (app) {
    try {
      await app.close();
      app = null;
      moduleRef = null;
      console.log('✅ Test server closed');
    } catch (error) {
      console.error('❌ Failed to close test server:', error);
      throw error;
    }
  }
}

/**
 * Gets the current test server instance.
 *
 * @returns NestJS application instance
 * @throws Error if server not initialized
 */
export function getTestServer(): INestApplication {
  if (!app) {
    throw new Error('Test server not initialized. Call createTestServer() first.');
  }
  return app;
}

/**
 * Gets a service instance from the test application.
 * Useful for accessing services in tests.
 *
 * @param serviceClass - Service class to retrieve
 * @returns Service instance
 *
 * @example
 * ```typescript
 * const userService = getService(UserService);
 * const user = await userService.findOne(userId);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getService<T>(serviceClass: new (...args: any[]) => T): T {
  if (!moduleRef) {
    throw new Error('Test module not initialized. Call createTestServer() first.');
  }
  return moduleRef.get<T>(serviceClass);
}

/**
 * Gets the HTTP server for making requests.
 * Use with supertest for API testing.
 *
 * @returns HTTP server instance
 *
 * @example
 * ```typescript
 * import * as request from 'supertest';
 * const httpServer = getHttpServer();
 * await request(httpServer).get('/api/users').expect(200);
 * ```
 */
export function getHttpServer() {
  const server = getTestServer();
  return server.getHttpServer();
}
