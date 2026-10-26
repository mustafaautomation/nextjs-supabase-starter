import { defineConfig } from 'vitest/config';

// Runs against a real Supabase stack (`supabase start`), not mocks.
export default defineConfig({
  test: {
    include: ['tests/rls/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
