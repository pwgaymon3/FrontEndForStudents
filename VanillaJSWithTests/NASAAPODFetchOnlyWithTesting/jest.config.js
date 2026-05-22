export default {
  testEnvironment: "jsdom",
  testPathIgnorePatterns: [
    "/node_modules/",
    "\\.spec\\.js$",           // ignore Playwright files
    "\\.vitest\\.test\\.js$"   // ignore Vitest-specific files
  ],
};