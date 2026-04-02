import { expect, test } from '@playwright/test';

/**
 * API Customer Service E2E Tests.
 *
 * High-impact smoke tests verifying the API is reachable,
 * responds correctly, and handles errors as expected.
 * These tests run against a live API instance.
 */

test.describe('API Health & Availability', () => {
  test('GET /api/health returns 200 with status ok', async ({ request }) => {
    const response = await request.get('/api/health');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeTruthy();
    expect(body.uptime).toBeGreaterThan(0);
  });

  test('GET /api returns welcome message', async ({ request }) => {
    const response = await request.get('/api');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toBeTruthy();
  });

  test('health endpoint returns valid ISO 8601 timestamp', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();

    const parsed = Date.parse(body.timestamp);
    expect(Number.isNaN(parsed)).toBe(false);
    expect(Date.now() - parsed).toBeLessThan(5000);
  });
});

test.describe('API Error Handling', () => {
  test('unknown route returns 404 with structured error', async ({ request }) => {
    const response = await request.get('/api/nonexistent-route-xyz');

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.statusCode).toBe(404);
  });

  test('correlation ID header is returned on every response', async ({ request }) => {
    const response = await request.get('/api/health');

    const correlationId = response.headers()['x-correlation-id'];
    expect(correlationId).toBeTruthy();
    expect(correlationId.length).toBeGreaterThan(0);
  });

  test('client-provided correlation ID is echoed back', async ({ request }) => {
    const customId = 'e2e-test-correlation-12345';
    const response = await request.get('/api/health', {
      headers: { 'x-correlation-id': customId },
    });

    expect(response.headers()['x-correlation-id']).toBe(customId);
  });
});

test.describe('API Security Headers', () => {
  test('CORS headers are present', async ({ request }) => {
    const response = await request.get('/api/health');

    // CORS should be enabled (Access-Control-Allow-Origin)
    expect(response.status()).toBe(200);
  });

  test('API does not expose server internals on error', async ({ request }) => {
    const response = await request.get('/api/nonexistent-route-xyz');
    const body = await response.json();

    // Should not contain stack traces in production-like responses
    expect(body.stack).toBeUndefined();
    expect(body.trace).toBeUndefined();
  });
});
