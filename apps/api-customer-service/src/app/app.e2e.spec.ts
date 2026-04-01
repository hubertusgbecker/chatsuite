import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from './app.module';
import { configureApp } from '../main';

describe('GlobalExceptionFilter', () => {
  let app: Awaited<ReturnType<TestingModule['createNestApplication']>>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return standardized error format for unknown routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/nonexistent-route');

    // Unknown routes return error with our standardized format
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('path');
  });

  it('should return proper format for health endpoint', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('uptime');
    expect(typeof response.body.uptime).toBe('number');
  });

  it('should return welcome message from root endpoint', async () => {
    const response = await request(app.getHttpServer())
      .get('/api')
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('message');
    expect(typeof response.body.message).toBe('string');
  });

  it('should reject invalid POST body with validation error', async () => {
    // POST to a route that doesn't exist should be handled gracefully
    const response = await request(app.getHttpServer())
      .post('/api')
      .send({ invalid: 'data' });

    // Should return standardized error format, not crash
    expect(response.body).toHaveProperty('statusCode');
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('should enable CORS headers', async () => {
    const response = await request(app.getHttpServer())
      .options('/api')
      .set('Origin', 'http://localhost:4200')
      .set('Access-Control-Request-Method', 'GET');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });
});
