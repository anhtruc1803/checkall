import { randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const typingTestKey = (process.env.TYPING_LEADERBOARD_TEST_KEY ??= randomBytes(32).toString('hex'));
const typingTestDb = (process.env.TYPING_LEADERBOARD_TEST_DB ??= resolve(
  'artifacts',
  'playwright',
  `typing-${randomUUID()}.sqlite`,
));

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['json', { outputFile: 'artifacts/playwright/results.json' }]],
  use: { baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      TYPING_LEADERBOARD_DB: typingTestDb,
      TYPING_LEADERBOARD_ADMIN_KEY: typingTestKey,
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium', channel: 'chromium' },
    },
  ],
});
