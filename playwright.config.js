import { defineConfig, devices } from '@playwright/test';

process.loadEnvFile('.env');

// The tests run against the real Jira site, as the test account whose login is saved
// in e2e/.auth/state.json. `npm run e2e:login` saves it again when it expires.
export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 30_000 },
  workers: 1,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'https://dzaffren.atlassian.net',
    storageState: 'e2e/.auth/state.json',
    trace: 'retain-on-failure',
  },
});
