import { defineConfig, devices } from '@playwright/test';

/**
 * Cross-browser is tiered on purpose. Chromium runs everything. Firefox and
 * WebKit run only the critical path, because once a flow is confirmed to work
 * cross-engine, re-running every feature test on every engine costs runtime
 * and returns very little extra signal.
 */
const CRITICAL = /0[14]-|06-/;   // login, checkout, session guard

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /setup\/auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      testIgnore: [/.*/],
      testMatch: CRITICAL,
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      testIgnore: [/.*/],
      testMatch: CRITICAL,
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
});
