import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api-customer-service-integration',

  plugins: [
    nxViteTsPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],

  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.spec.ts'],
    testTimeout: 30000,
    reporters: ['default'],
    globalSetup: ['./tests/integration/setup.ts'],
    setupFiles: ['./tests/integration/vitest.setup.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      reportsDirectory: '../../coverage/apps/api-customer-service-integration',
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.mock.ts', 'src/main.ts'],
    },
  },
});
