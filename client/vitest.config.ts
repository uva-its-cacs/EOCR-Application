import path from 'path';
import { defineConfig } from 'vitest/config';

// ----------------------------------------------------------------------

// Separate from vite.config.ts on purpose: tests must not load vite-plugin-checker.
// The alias matches vite.config.ts so tests can use the same `src/...` imports.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
