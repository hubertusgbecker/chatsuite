import { defineConfig, devices } from '@playwright/test';

/**
 * ChatSuite E2E Test Configuration.
 *
 * Tests run against locally-served apps (API on :3333, Client on :4200).
 * For Docker-based testing, override BASE_URL via environment variables.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI'] ? 'github' : 'list',
  timeout: 30_000,

  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'api',
      testMatch: /api\/.*\.spec\.ts/,
      use: {
        baseURL: process.env['API_BASE_URL'] || 'http://localhost:3333',
      },
    },
    {
      name: 'client',
      testMatch: /client\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env['CLIENT_BASE_URL'] || 'http://localhost:4200',
      },
    },
  ],
});
