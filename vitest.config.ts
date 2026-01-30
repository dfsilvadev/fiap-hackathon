import { defineConfig } from "vitest/config";
import path from "node:path";
import type { UserConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test",
      NODE_ENV: "test",
      JWT_SECRET: process.env.JWT_SECRET ?? "test-jwt-secret",
    },
    include: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/**/*.test.ts", "src/server.ts"],
    },
  },
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@application": path.resolve(__dirname, "./src/application"),
      "@infrastructure": path.resolve(__dirname, "./src/infrastructure"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
} as UserConfig);
