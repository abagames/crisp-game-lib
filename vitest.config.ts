import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom for DOM implementation
    environment: 'happy-dom',

    // Test files pattern
    include: ['test/**/*.test.ts'],

    // Global setup/teardown
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'test/**/*',
      ],
    },

    // Timeout for tests
    testTimeout: 10000,

    // Run tests sequentially to share Canvas initialization
    sequence: {
      concurrent: false,
    },
  },
});
