import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:5000",
    // só para ambientes com proxy que intercepta HTTPS (ex.: sandbox de desenvolvimento)
    ignoreHTTPSErrors: !!process.env.PW_IGNORE_HTTPS,
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
});
