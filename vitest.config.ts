import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    include: ["src/test/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
