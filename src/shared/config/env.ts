import { z } from "zod";

function parseOptionalBooleanEnv(value: unknown): boolean | undefined {
  if (value == null) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return undefined;

  const normalized = value.trim().toLowerCase();
  if (normalized === "") return undefined;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  ENABLE_HELMET: z.preprocess(parseOptionalBooleanEnv, z.boolean().optional()),
  ENABLE_RATE_LIMIT: z.preprocess(parseOptionalBooleanEnv, z.boolean().optional()),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(20),
  RATE_LIMIT_DEV_MAX: z.coerce.number().default(1000),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("24h"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
    throw new Error(`Invalid environment: ${message}`);
  }
  return parsed.data;
}

export const env = loadEnv();
