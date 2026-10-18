import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  test: {
    environment: "node",
    include: ["packages/core/src/**/*.test.ts", "apps/web/__tests__/**/*.test.ts"],
    exclude: ["**/*.integration.test.ts", "**/*.e2e.test.ts"],
    passWithNoTests: false,
    clearMocks: true,
    restoreMocks: true,
    testTimeout: 5000,
  },
});
