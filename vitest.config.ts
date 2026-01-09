import path from 'path';
import { defineConfig } from 'vitest/config';

const resolveAliases = {
  '#': path.resolve(__dirname, 'src'),
}

export default defineConfig({
  resolve: {
    alias: resolveAliases,
  },
  test: {
    coverage: {
      exclude: ['**/*-mock*'],
      thresholds: {
        statements: 80,
        functions: 80,
        branches: 80,
        lines: 80,
      },
      reportOnFailure: true,
    },
    globals: true,
    environment: 'node',
    testTimeout: 10000,
  },
});
