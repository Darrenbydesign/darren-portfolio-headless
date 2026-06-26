import { defineConfig, devices } from "@playwright/test";

const localBaseUrl = "http://127.0.0.1:4330";
const mockApiUrl = "http://127.0.0.1:1338/api";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || localBaseUrl;

export default defineConfig({
  testDir: "./test/e2e",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: "node ./test/e2e/mock-strapi.mjs",
          cwd: import.meta.dirname,
          url: "http://127.0.0.1:1338/health",
          reuseExistingServer: !process.env.CI,
          timeout: 30_000,
        },
        {
          command:
            "node ./node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4330",
          cwd: import.meta.dirname,
          env: {
            ASTRO_TELEMETRY_DISABLED: "1",
            STRAPI_API_URL: mockApiUrl,
          },
          url: localBaseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ],
});
