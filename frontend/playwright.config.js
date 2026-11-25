import { defineConfig, devices } from '@playwright/test';

// End-to-end checks against the running Docker Compose stack (not part of CI's required checks).
// E2E_BASE_URL defaults to the Compose frontend; DEMO_ADMIN_PASSWORD comes from the root .env.
const docs = process.env.DOCS === '1';

export default defineConfig({
  testDir: './e2e',
  testIgnore: docs ? undefined : 'docs/**',
  testMatch: docs ? 'docs/**/*.spec.js' : '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    // Traces would record login requests (passwords, tokens), so none are kept.
    trace: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    ...(docs ? [] : [{ name: 'mobile', use: { ...devices['Pixel 7'] } }]),
  ],
});
