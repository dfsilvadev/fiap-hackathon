import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES = ["coordinator", "teacher", "student"] as const;

const CATEGORIES = [
  "Português",
  "Matemática",
  "Ciências",
  "História",
  "Geografia",
] as const;

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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    process.stderr.write(String(e));
    prisma.$disconnect();
    process.exit(1);
  });
