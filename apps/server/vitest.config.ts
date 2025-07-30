import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'test/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.ts'
      ],
      include: ['src/**/*.ts']
    }
  }
});
