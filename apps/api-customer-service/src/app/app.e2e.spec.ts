import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './app.module';
import { configureApp } from '../main';

describe('API Customer Service (e2e)', () => {
  let app: Awaited<ReturnType<TestingModule['createNestApplication']>>;
  let httpServer: ReturnType<typeof app.getHttpServer>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api (welcome)', () => {
    it('should return 200 with welcome message', async () => {
      const response = await request(httpServer)
        .get('/api')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual({
        message: 'Welcome to api-customer-service of ChatSuite!',
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health status with all fields', async () => {
      const response = await request(httpServer)
        .get('/api/health')
        .expect(HttpStatus.OK)
        .expect('Content-Type', /json/);

      expect(response.body.status).toBe('ok');
      expect(response.body.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);

      // Timestamp should be valid ISO 8601 and recent
      const parsed = Date.parse(response.body.timestamp);
      expect(isNaN(parsed)).toBe(false);
      expect(Date.now() - parsed).toBeLessThan(5000);
    });
  });

  describe('GlobalExceptionFilter', () => {
    it('should return 404 with standardized format for unknown routes', async () => {
      const response = await request(httpServer)
        .get('/api/this-route-does-not-exist')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('NOT_FOUND');
      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toContain('Cannot GET');
      expect(response.body.path).toBe('/api/this-route-does-not-exist');
      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    });

    it('should return 404 for unknown methods on existing routes', async () => {
      const response = await request(httpServer)
        .delete('/api/health')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.statusCode).toBe(404);
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('should not leak stack traces in error responses', async () => {
      const response = await request(httpServer)
        .get('/api/nonexistent')
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.stack).toBeUndefined();
      expect(JSON.stringify(response.body)).not.toContain('at ');
      expect(JSON.stringify(response.body)).not.toContain('.ts:');
    });

    it('should include correlation-id in error responses when provided', async () => {
      const correlationId = 'test-corr-id-12345';
      const response = await request(httpServer)
        .get('/api/nonexistent')
        .set('x-correlation-id', correlationId)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body.correlationId).toBe(correlationId);
      expect(response.headers['x-correlation-id']).toBe(correlationId);
    });
  });

  describe('Correlation ID', () => {
    it('should generate correlation-id when not provided', async () => {
      const response = await request(httpServer).get('/api').expect(200);

      expect(response.headers['x-correlation-id']).toBeDefined();
      expect(response.headers['x-correlation-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should echo back client-provided correlation-id', async () => {
      const clientId = 'client-trace-abc';
      const response = await request(httpServer)
        .get('/api')
        .set('x-correlation-id', clientId)
        .expect(200);

      expect(response.headers['x-correlation-id']).toBe(clientId);
    });
  });

  describe('ValidationPipe', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(httpServer)
        .post('/api')
        .set('Content-Type', 'application/json')
        .send('{"broken json');

      // Should get a proper error, not a crash
      expect([400, 404]).toContain(response.status);
      expect(typeof response.body.statusCode).toBe('number');
      expect(typeof response.body.message).toBe('string');
    });

    it('should reject requests with Content-Type mismatch', async () => {
      const response = await request(httpServer)
        .post('/api')
        .set('Content-Type', 'text/plain')
        .send('not json');

      // Should not crash, should return proper error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toBeDefined();
    });

    it('should handle oversized payloads without crashing', async () => {
      const largePayload = 'x'.repeat(1024 * 1024); // 1MB
      const response = await request(httpServer)
        .post('/api')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ data: largePayload }));

      // Should return an error, not crash
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Security', () => {
    it('should not reflect SQL injection payloads in responses', async () => {
      const sqlPayload = "'; DROP TABLE users; --";
      const response = await request(httpServer)
        .get(`/api/${encodeURIComponent(sqlPayload)}`)
        .expect(HttpStatus.NOT_FOUND);

      // The response should not execute or reflect SQL
      expect(response.body.message).not.toContain('DROP TABLE');
    });

    it('should not reflect XSS payloads in responses', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      const response = await request(httpServer)
        .get(`/api/${encodeURIComponent(xssPayload)}`)
        .expect(HttpStatus.NOT_FOUND);

      // Response is JSON, not HTML, so XSS in path is contained
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return JSON content-type for all error responses', async () => {
      const paths = ['/api/missing', '/api/../../../etc/passwd', '/api/%00'];
      for (const p of paths) {
        const response = await request(httpServer).get(p);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });
  });

  describe('CORS', () => {
    it('should return CORS headers for preflight requests', async () => {
      const response = await request(httpServer)
        .options('/api')
        .set('Origin', 'http://localhost:4200')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.status).toBeLessThan(400);
    });

    it('should include CORS origin header on regular requests', async () => {
      const response = await request(httpServer)
        .get('/api')
        .set('Origin', 'http://localhost:4200')
        .expect(HttpStatus.OK);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should list allowed methods in preflight response', async () => {
      const response = await request(httpServer)
        .options('/api')
        .set('Origin', 'http://localhost:4200')
        .set('Access-Control-Request-Method', 'POST');

      const allowedMethods =
        response.headers['access-control-allow-methods'] || '';
      expect(allowedMethods).toMatch(/GET/);
    });
  });

  describe('Response format consistency', () => {
    it('should always return JSON content-type for API responses', async () => {
      const endpoints = ['/api', '/api/health'];
      for (const endpoint of endpoints) {
        const response = await request(httpServer).get(endpoint).expect(200);
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    it('should always return JSON content-type for error responses', async () => {
      const response = await request(httpServer)
        .get('/api/missing')
        .expect(404);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Performance', () => {
    it('should respond to health check within 200ms', async () => {
      const start = Date.now();
      await request(httpServer).get('/api/health').expect(200);
      expect(Date.now() - start).toBeLessThan(200);
    });

    it('should handle concurrent requests without errors', async () => {
      const batchSize = 3;
      const totalRequests = 10;
      const responses = [];

      for (let i = 0; i < totalRequests; i += batchSize) {
        const batch = Array.from(
          { length: Math.min(batchSize, totalRequests - i) },
          () => request(httpServer).get('/api').expect(200),
        );
        const batchResponses = await Promise.all(batch);
        responses.push(...batchResponses);
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      expect(responses).toHaveLength(10);
      for (const res of responses) {
        expect(res.body.message).toBe(
          'Welcome to api-customer-service of ChatSuite!',
        );
      }
    });
  });
});
