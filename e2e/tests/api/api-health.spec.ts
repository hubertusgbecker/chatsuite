import { configureApp } from '@chatsuite/core';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../../../apps/api-customer-service/src/app/app.module';

/**
 * API Customer Service E2E Tests.
 *
 * High-impact smoke tests verifying the API is reachable,
 * responds correctly, and handles errors as expected.
 * Uses supertest with the NestJS test module.
 */

let app: INestApplication;
let httpServer: ReturnType<INestApplication['getHttpServer']>;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  httpServer = app.getHttpServer();
});

afterAll(async () => {
  await app.close();
});

describe('API Health & Availability', () => {
  it('GET /api/health returns 200 with status ok', async () => {
    const response = await request(httpServer).get('/api/health').expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeTruthy();
    expect(response.body.uptime).toBeGreaterThan(0);
  });

  it('GET /api returns welcome message', async () => {
    const response = await request(httpServer).get('/api').expect(200);

    expect(response.body.message).toBeTruthy();
  });

  it('health endpoint returns valid ISO 8601 timestamp', async () => {
    const response = await request(httpServer).get('/api/health');

    const parsed = Date.parse(response.body.timestamp);
    expect(Number.isNaN(parsed)).toBe(false);
    expect(Date.now() - parsed).toBeLessThan(5000);
  });
});

describe('API Error Handling', () => {
  it('unknown route returns 404 with structured error', async () => {
    const response = await request(httpServer).get('/api/nonexistent-route-xyz').expect(404);

    expect(response.body.statusCode).toBe(404);
  });

  it('correlation ID header is returned on every response', async () => {
    const response = await request(httpServer).get('/api/health');

    const correlationId = response.headers['x-correlation-id'];
    expect(correlationId).toBeTruthy();
    expect(correlationId.length).toBeGreaterThan(0);
  });

  it('client-provided correlation ID is echoed back', async () => {
    const customId = 'e2e-test-correlation-12345';
    const response = await request(httpServer).get('/api/health').set('x-correlation-id', customId);

    expect(response.headers['x-correlation-id']).toBe(customId);
  });
});

describe('API Security Headers', () => {
  it('CORS headers are present', async () => {
    const response = await request(httpServer)
      .options('/api/health')
      .set('Origin', 'http://localhost:4200');

    expect(response.headers['access-control-allow-origin']).toBeTruthy();
  });

  it('API does not expose server internals on error', async () => {
    const response = await request(httpServer).get('/api/nonexistent-route-xyz');

    expect(response.body.stack).toBeUndefined();
    expect(response.body.trace).toBeUndefined();
  });
});
