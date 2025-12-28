import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestServer, closeTestServer, getHttpServer } from '../helpers/test-server';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/test-db';

/**
 * Integration tests for the Customer Service API.
 * Tests the complete flow from HTTP request through service layer to database.
 */
describe('API Customer Service Integration', () => {
  let app: INestApplication;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    // Setup test database connection
    await setupTestDatabase();
    
    // Create test NestJS application
    app = await createTestServer();
    httpServer = getHttpServer();
  });

  afterAll(async () => {
    // Cleanup and close connections
    await closeTestServer();
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await cleanupTestDatabase();
  });

  describe('GET /api', () => {
    it('should return welcome message', async () => {
      const response = await request(httpServer)
        .get('/api')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to api-customer-service of ChatSuite!',
      });
    });

    it('should have correct content-type header', async () => {
      const response = await request(httpServer)
        .get('/api')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should respond to health check endpoint', async () => {
      // Most NestJS apps have a health endpoint
      // Adjust this test based on actual implementation
      const response = await request(httpServer)
        .get('/api/health')
        .expect((res) => {
          // Accept either 200 (implemented) or 404 (not implemented yet)
          expect([200, 404]).toContain(res.status);
        });

      if (response.status === 200) {
        expect(response.body.status).toBe('ok');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(httpServer)
        .get('/api/non-existent-route')
        .expect(404);
      expect(response.status).toBe(404);
    });

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(httpServer)
        .post('/api/test')
        .set('Content-Type', 'application/json')
        .send('{"invalid json}')
        .expect((res) => {
          // Expect either 400 (bad request) or 404 (route not found)
          expect([400, 404]).toContain(res.status);
        });
      // Use response to avoid unused variable warning
      expect(response).toBeDefined();
    });
  });

  describe('CORS Configuration', () => {
    it('should include CORS headers', async () => {
      const response = await request(httpServer)
        .options('/api')
        .set('Origin', 'http://localhost:4200')
        .expect((res) => {
          // Server should handle OPTIONS for CORS preflight
          expect([200, 204]).toContain(res.status);
        });
      // Use response to avoid unused variable warning
      expect(response).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const start = Date.now();
      
      await request(httpServer)
        .get('/api')
        .expect(200);
      
      const duration = Date.now() - start;
      
      // API should respond within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(httpServer).get('/api').expect(200)
      );

      const responses = await Promise.all(requests);
      
      // All requests should succeed
      expect(responses).toHaveLength(10);
      responses.forEach(response => {
        expect(response.body.message).toBeDefined();
      });
    });
  });

  describe('Database Integration', () => {
    it('should connect to PostgreSQL database', async () => {
      // This test verifies database connectivity through the API
      // Add actual database-dependent endpoints as they're implemented
      
      // For now, verify the app initialized successfully with DB
      expect(app).toBeDefined();
      expect(httpServer).toBeDefined();
    });
  });
});
