/**
 * Jest setup file for integration tests.
 * Runs before each test file.
 *
 * Configure test environment, global mocks, and test utilities.
 */

// Set test timeout globally
jest.setTimeout(30000); // 30 seconds for integration tests

// Mock console methods to reduce noise in test output
const originalConsole = { ...console };

beforeAll(() => {
  // Reduce console noise during tests
  // console.log = jest.fn();
  // console.info = jest.fn();
  // console.warn = jest.fn();

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

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit process - let tests complete
});

// Custom matchers can be added here
expect.extend({
  /**
   * Custom matcher to check if a value is a valid UUID.
   */
  toBeValidUuid(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
    };
  },

  /**
   * Custom matcher to check if a value is a valid ISO date string.
   */
  toBeValidISODate(received: string) {
    const date = new Date(received);
    const pass = !isNaN(date.getTime()) && received === date.toISOString();

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid ISO date`
          : `expected ${received} to be a valid ISO date`,
    };
  },
});

// TypeScript type augmentation for custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidUuid(): R;
      toBeValidISODate(): R;
    }
  }
}

export {};
