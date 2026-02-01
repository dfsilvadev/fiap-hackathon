/**
 * Configuração do Prisma (local e Docker).
 * No host, "db" na URL vira "localhost" para push/migrate/seed.
 */
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import type { PrismaConfig } from "prisma";

config();

let url = process.env.DATABASE_URL ?? "";
// No host, "db" não resolve; trocar por localhost para push/migrate/seed
const isInDocker = fs.existsSync("/.dockerenv");
if (!isInDocker && url.includes("db:")) {
  url = url.replace(/(@|\/\/)db:/g, "$1localhost:");
}

export default {
  schema: path.join("prisma"),
  datasource: {
    url,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;
