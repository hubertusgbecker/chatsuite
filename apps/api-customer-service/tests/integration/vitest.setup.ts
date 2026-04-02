/**
 * Vitest setup file for integration tests.
 * Runs before each test file.
 *
 * Configure test environment, global mocks, and test utilities.
 */

// Mock console methods to reduce noise in test output
const originalConsole = { ...console };

beforeAll(() => {
  // Keep errors visible
  console.error = originalConsole.error;
});

afterAll(() => {
  // Restore console
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
