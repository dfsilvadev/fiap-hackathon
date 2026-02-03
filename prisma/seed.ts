import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

let connectionString = process.env.DATABASE_URL ?? "";
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}
const isInDocker = fs.existsSync("/.dockerenv");
if (!isInDocker && connectionString.includes("db:")) {
  connectionString = connectionString.replace(/(@|\/\/)db:/g, "$1localhost:");
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
const TEACHER_EMAIL = "professor@example.com";
const TEACHER_PASSWORD = "Senha123";
const STUDENT_EMAIL = "aluno@example.com";
const STUDENT_PASSWORD = "Senha123";

async function main(): Promise<void> {
  for (const name of ROLES) {
    const existing = await prisma.role.findFirst({ where: { name } });
    if (!existing) {
      await prisma.role.create({ data: { name } });
      process.stdout.write(`Role created: ${name}\n`);
    }
  }

  const categoryIds: string[] = [];
  for (const name of CATEGORIES) {
    const existing = await prisma.category.findFirst({ where: { name } });
    if (!existing) {
      const cat = await prisma.category.create({ data: { name } });
      categoryIds.push(cat.id);
      process.stdout.write(`Category created: ${name}\n`);
    } else {
      categoryIds.push(existing.id);
    }
  }
  const firstCategoryId = categoryIds[0];

  const coordinatorRole = await prisma.role.findFirst({
    where: { name: "coordinator" },
  });
  if (coordinatorRole) {
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
          roleId: coordinatorRole.id,
        },
      });
      process.stdout.write(
        `User created: ${DEFAULT_ADMIN_EMAIL} (password: ${DEFAULT_ADMIN_PASSWORD})\n`
      );
    }
  }

  const teacherRole = await prisma.role.findFirst({ where: { name: "teacher" } });
  if (teacherRole) {
    const existing = await prisma.user.findUnique({
      where: { email: TEACHER_EMAIL },
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash(TEACHER_PASSWORD, 10);
      const teacher = await prisma.user.create({
        data: {
          name: "Professor Teste",
          email: TEACHER_EMAIL,
          passwordHash,
          roleId: teacherRole.id,
        },
      });
      await prisma.teacherSubject.create({
        data: {
          teacherId: teacher.id,
          categoryId: firstCategoryId,
        },
      });
      process.stdout.write(
        `User created: ${TEACHER_EMAIL} (password: ${TEACHER_PASSWORD})\n`
      );
    }
  }

  const studentRole = await prisma.role.findFirst({ where: { name: "student" } });
  if (studentRole) {
    const existing = await prisma.user.findUnique({
      where: { email: STUDENT_EMAIL },
    });
    if (!existing) {
      const passwordHash = await bcrypt.hash(STUDENT_PASSWORD, 10);
      const student = await prisma.user.create({
        data: {
          name: "Aluno Teste",
          email: STUDENT_EMAIL,
          passwordHash,
          roleId: studentRole.id,
          currentGrade: "7",
          guardians: [
            {
              name: "Responsável Teste",
              phone: "11999999999",
              email: "responsavel@example.com",
              relationship: "pai",
            },
          ] as object,
        },
      });
      for (const catId of categoryIds) {
        await prisma.studentLearningLevel.upsert({
          where: {
            studentId_categoryId: { studentId: student.id, categoryId: catId },
          },
          create: { studentId: student.id, categoryId: catId, level: "1" },
          update: {},
        });
      }
      process.stdout.write(
        `User created: ${STUDENT_EMAIL} (password: ${STUDENT_PASSWORD})\n`
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
