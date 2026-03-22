import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude compiled .js test files from dist directory
    // Tests should only run from src/**/*.test.ts files
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
    globals: true,
  },
});
