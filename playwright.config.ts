import { defineConfig, devices } from "@playwright/test";

/**
 * Browser smoke tests.
 *  - Locally and in CI they build-test the app: `npm run build` first, then `npm run test:e2e`.
 *  - Against a deployed site: E2E_BASE_URL=https://your-site npm run test:e2e
 * CHROME_PATH lets a machine without Playwright's browsers use an installed Chrome.
 */
const external = process.env.E2E_BASE_URL?.replace(/\/+$/, "");
const local = "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: external ?? local,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath: process.env.CHROME_PATH || undefined },
  },
  webServer: external
    ? undefined
    : { command: "npm run start -- -p 3100", url: local, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
