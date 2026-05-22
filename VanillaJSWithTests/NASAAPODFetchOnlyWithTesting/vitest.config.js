import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true, // so you don't need to import describe/test/expect
    include: ["**/*.vitest.test.js"], // ← only files ending with .vitest.test.js
    threads: false, // run tests in the main thread to avoid overlapping DOM state
  },
});
