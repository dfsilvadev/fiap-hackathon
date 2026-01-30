import { describe, it, expect } from "vitest";
import { env } from "./env.js";

describe("env", () => {
  it("should expose PORT and DATABASE_URL", () => {
    expect(env.PORT).toBeDefined();
    expect(typeof env.PORT).toBe("number");
    expect(env.DATABASE_URL).toBeDefined();
    expect(typeof env.DATABASE_URL).toBe("string");
  });

  it("should have NODE_ENV as development | test | production", () => {
    expect(["development", "test", "production"]).toContain(env.NODE_ENV);
  });
});
