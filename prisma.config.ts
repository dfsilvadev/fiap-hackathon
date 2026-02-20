/** Prisma config; uses localhost when not running in Docker. */
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import type { PrismaConfig } from "prisma";

config();

let url = process.env.DATABASE_URL ?? "";
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
    seed: "node --import tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;
