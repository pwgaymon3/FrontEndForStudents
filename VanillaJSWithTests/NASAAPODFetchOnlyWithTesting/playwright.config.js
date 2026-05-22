import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__",
  testMatch: "**/*.spec.js",
  use: {
    baseURL: "http://127.0.0.1:8080",
  },
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:8080",
    reuseExistingServer: !process.env.CI,
  },
    // Explicitly separate folders to avoid the clash
  outputDir: './test-results',           // ← artifacts, traces, JSON, etc.
  reporter: [
    ['html', { outputFolder: './playwright-report' }],  // ← nice HTML report
    ['json', { outputFile: './test-results/playwright-results.json' }]
  ],
});
