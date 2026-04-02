import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api-customer-service',

  plugins: [
    nxViteTsPaths(),
    swc.vite({
      module: { type: 'es6' },
    }),
  ],

  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['tests/integration/**'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/api-customer-service',
      provider: 'v8',
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
});
