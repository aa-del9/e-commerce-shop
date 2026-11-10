import { defineConfig, devices } from "@playwright/test";

// Smoke tests run against a deployed or local storefront: BASE_URL=https://… pnpm test:e2e
// Without BASE_URL every test is skipped, so CI without a store stays green.
export default defineConfig({
  forbidOnly: !!process.env.CI,
  projects: [
    {
      name: "mobile-360",
      use: { ...devices["Desktop Chrome"], viewport: { height: 800, width: 360 } },
    },
    {
      name: "desktop-1280",
      use: { ...devices["Desktop Chrome"], viewport: { height: 900, width: 1280 } },
    },
  ],
  reporter: process.env.CI ? "github" : "list",
  retries: process.env.CI ? 1 : 0,
  testDir: "e2e",
  timeout: 60_000,
  use: {
    baseURL: process.env.BASE_URL,
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined },
    trace: "retain-on-failure",
  },
});
