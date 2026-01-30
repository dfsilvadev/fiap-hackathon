import crypto from "node:crypto";

const HASH_ALGORITHM = "sha256";

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash(HASH_ALGORITHM).update(token).digest("hex");
}
