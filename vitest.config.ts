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
        statements: 70,
        functions: 70,
        branches: 70,
        lines: 70,
      },
      reportOnFailure: true,
    },
    globals: true,
    environment: 'node',
    testTimeout: 10000,
  },
});
