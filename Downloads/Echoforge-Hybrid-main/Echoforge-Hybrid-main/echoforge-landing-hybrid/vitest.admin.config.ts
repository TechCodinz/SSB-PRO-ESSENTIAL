import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/admin/unit/**/*.spec.ts"],
    reporters: "default",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts", "app/api/admin/**/*.ts"],
    },
  },
});
