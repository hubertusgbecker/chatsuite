/* eslint-disable */
export default {
  displayName: 'api-customer-service-integration',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['**/tests/integration/**/*.spec.ts'],
  globals: {},
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/api-customer-service-integration',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '.spec.ts$',
    '.mock.ts$',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.mock.ts',
    '!src/main.ts',
  ],
  testTimeout: 30000, // 30 seconds for integration tests

  // Global setup and teardown
  globalSetup: '<rootDir>/tests/integration/setup.ts',
  globalTeardown: '<rootDir>/tests/integration/teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/jest.setup.ts'],

  // Run tests sequentially to avoid database conflicts
  maxWorkers: 1,

  // Fail tests on console errors
  errorOnDeprecated: true,

  // Verbose output for debugging
  verbose: true,
};
