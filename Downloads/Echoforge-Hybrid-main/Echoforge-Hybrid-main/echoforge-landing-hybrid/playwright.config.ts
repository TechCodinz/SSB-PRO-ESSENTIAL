import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ? Number(process.env.PLAYWRIGHT_PORT) : 3000;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/e2e/**/*.spec.ts", "**/admin/playwright/**/*.spec.ts"],
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_NO_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        port: PORT,
        reuseExistingServer: !process.env.CI,
        cwd: __dirname,
        stdout: "pipe",
        stderr: "pipe",
      },
});
