import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ROLES = ["coordinator", "teacher", "student"] as const;

const CATEGORIES = [
  "Português",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
] as const;

const DEFAULT_ADMIN_EMAIL = "admin@example.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";

async function main(): Promise<void> {
  for (const name of ROLES) {
    const existing = await prisma.role.findFirst({ where: { name } });
    if (!existing) {
      await prisma.role.create({ data: { name } });
      process.stdout.write(`Role created: ${name}\n`);
    }
  }

  for (const name of CATEGORIES) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) {
      await prisma.category.create({ data: { name } });
      process.stdout.write(`Category created: ${name}\n`);
    }
  }

  const coordinator = await prisma.role.findFirst({
    where: { name: "coordinator" },
  });
  if (coordinator) {
    const existing = await prisma.user.findUnique({
      where: { email: DEFAULT_ADMIN_EMAIL },
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      await prisma.user.create({
        data: {
          name: "Admin",
          email: DEFAULT_ADMIN_EMAIL,
          passwordHash,
          roleId: coordinator.id,
        },
      });
      process.stdout.write(
        `User created: ${DEFAULT_ADMIN_EMAIL} (password: ${DEFAULT_ADMIN_PASSWORD})\n`
      );
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    process.stderr.write(String(e));
    prisma.$disconnect();
    process.exit(1);
  });
