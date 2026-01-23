import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/main/index.ts'],
    format: ['esm'],
    target: 'node22',
    splitting: false,
    sourcemap: true,
    clean: true,
});
