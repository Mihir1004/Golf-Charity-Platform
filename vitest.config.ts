import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: [
        "src/server/domain/**/*.ts",
        "src/server/services/score-service.ts",
        "src/server/services/winner-service.ts",
        "src/lib/validators.ts",
      ],
      exclude: ["src/generated/**"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
