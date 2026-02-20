import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";
import fs from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client.js";

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

const CATEGORIES = ["Português", "Matemática", "Ciências", "História", "Geografia"] as const;

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
      process.stdout.write(`User created: ${TEACHER_EMAIL} (password: ${TEACHER_PASSWORD})\n`);
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
      process.stdout.write(`User created: ${STUDENT_EMAIL} (password: ${STUDENT_PASSWORD})\n`);
    }
  }

  // Seed de conteúdos, trilha padrão e avaliação básica para ambiente de desenvolvimento
  const teacherUser = await prisma.user.findUnique({
    where: { email: TEACHER_EMAIL },
  });
  const studentUser = await prisma.user.findUnique({
    where: { email: STUDENT_EMAIL },
  });

  if (teacherUser && studentUser && firstCategoryId) {
    // Conteúdos da categoria/série do aluno de teste
    const existingContent = await prisma.content.findFirst({
      where: {
        categoryId: firstCategoryId,
        grade: studentUser.currentGrade ?? "7",
      },
    });

    const grade = studentUser.currentGrade ?? "7";

    let level1ContentId: string | null = null;
    let level2ContentId: string | null = null;
    let level3ContentId: string | null = null;
    let reforcoContentId: string | null = null;

    if (!existingContent) {
      const level1 = await prisma.content.create({
        data: {
          title: "Introdução ao tema (Nível 1)",
          contentText: "Conteúdo introdutório para o aluno começar a se familiarizar com o tema.",
          categoryId: firstCategoryId,
          grade,
          level: "1",
          userId: teacherUser.id,
          topics: ["conceitos básicos"],
          tags: ["nivel-1", "introducao"],
        } as never,
      });

      const level2 = await prisma.content.create({
        data: {
          title: "Aprofundamento do tema (Nível 2)",
          contentText: "Conteúdo intermediário para aprofundar o conhecimento do aluno.",
          categoryId: firstCategoryId,
          grade,
          level: "2",
          userId: teacherUser.id,
          topics: ["aplicações", "exemplos"],
          tags: ["nivel-2", "aprimoramento"],
        } as never,
      });

      const level3 = await prisma.content.create({
        data: {
          title: "Desafios avançados (Nível 3)",
          contentText: "Conteúdo avançado com desafios para consolidar o aprendizado.",
          categoryId: firstCategoryId,
          grade,
          level: "3",
          userId: teacherUser.id,
          topics: ["desafios", "problemas"],
          tags: ["nivel-3", "desafios"],
        } as never,
      });

      const reforco = await prisma.content.create({
        data: {
          title: "Reforço do tema",
          contentText:
            "Conteúdo de reforço focado nos principais pontos de dificuldade dos alunos.",
          categoryId: firstCategoryId,
          grade,
          level: "reforco",
          userId: teacherUser.id,
          topics: ["revisão", "reforço"],
          // Tags alinhadas com as tags das questões da avaliação seed
          tags: ["diagnostico", "autopercepcao"],
        } as never,
      });

      level1ContentId = level1.id;
      level2ContentId = level2.id;
      level3ContentId = level3.id;
      reforcoContentId = reforco.id;
      process.stdout.write("Conteúdos pedagógicos base criados.\n");
    } else {
      // Reaproveita conteúdos existentes para montar trilha/avaliação
      const contents = await prisma.content.findMany({
        where: {
          categoryId: firstCategoryId,
          grade: studentUser.currentGrade ?? "7",
        },
      });

      level1ContentId = contents.find((c) => c.level === "1")?.id ?? null;
      level2ContentId = contents.find((c) => c.level === "2")?.id ?? null;
      level3ContentId = contents.find((c) => c.level === "3")?.id ?? null;
      reforcoContentId = contents.find((c) => c.level === "reforco")?.id ?? null;
    }

    // Conteúdos adicionais de reforço para diferentes tópicos (idempotente por título)
    const reforcoSeeds = [
      {
        title: "Reforço de Frações",
        contentText: "Atividades de reforço focadas em frações e operações básicas.",
        topics: ["frações", "operações"],
        tags: ["fracoes", "operacoes"],
      },
      {
        title: "Reforço de Geografia",
        contentText: "Conteúdo de reforço para leitura e interpretação de mapas.",
        topics: ["mapas", "orientação"],
        tags: ["geografia", "mapas"],
      },
      {
        title: "Reforço de História",
        contentText: "Linha do tempo e exercícios de revisão de eventos históricos.",
        topics: ["linha do tempo", "eventos"],
        tags: ["historia", "linha-do-tempo"],
      },
      {
        title: "Reforço de Gramática",
        contentText: "Exercícios de ortografia e gramática para fixação de regras.",
        topics: ["ortografia", "gramática"],
        tags: ["gramatica", "ortografia"],
      },
    ] as const;

    for (const seed of reforcoSeeds) {
      const existingReforco = await prisma.content.findFirst({
        where: {
          categoryId: firstCategoryId,
          grade,
          level: "reforco",
          title: seed.title,
        },
      });

      if (existingReforco) continue;

      await prisma.content.create({
        data: {
          title: seed.title,
          contentText: seed.contentText,
          categoryId: firstCategoryId,
          grade,
          level: "reforco",
          userId: teacherUser.id,
          topics: seed.topics as unknown as object,
          tags: seed.tags as unknown as object,
        } as never,
      });
    }

    // Trilha padrão para a categoria/série
    const existingLearningPath = await prisma.learningPath.findFirst({
      where: {
        categoryId: firstCategoryId,
        grade: studentUser.currentGrade ?? "7",
        isDefault: true,
      },
    });

    if (!existingLearningPath && level1ContentId && level2ContentId && level3ContentId) {
      const learningPath = await prisma.learningPath.create({
        data: {
          name: "Trilha padrão - Série do aluno de teste",
          categoryId: firstCategoryId,
          grade: studentUser.currentGrade ?? "7",
          description: "Trilha padrão com conteúdos de nível 1, 2 e 3.",
          createdBy: teacherUser.id,
        },
      });

      await prisma.learningPathContent.createMany({
        data: [
          {
            learningPathId: learningPath.id,
            contentId: level1ContentId,
            orderNumber: 1,
          },
          {
            learningPathId: learningPath.id,
            contentId: level2ContentId,
            orderNumber: 2,
          },
          {
            learningPathId: learningPath.id,
            contentId: level3ContentId,
            orderNumber: 3,
          },
        ],
        skipDuplicates: true,
      });

      process.stdout.write("Trilha de aprendizado padrão criada.\n");
    }

    // Criação de 5 avaliações completas para ambiente de teste
    if (level1ContentId) {
      type AssessmentSeed = {
        title: string;
        description: string;
        grade: string;
        level: string;
        mainContentId: string | null;
        questions: Array<{
          questionText: string;
          questionType: string;
          options: string[] | null;
          correctAnswer: string;
          points: number;
          tags: string[];
        }>;
      };

      const assessmentSeeds: AssessmentSeed[] = [
        {
          title: "Avaliação diagnóstica - Nível 1",
          description: "Avaliação simples para medir o entendimento inicial do aluno.",
          grade: "7",
          level: "1",
          mainContentId: level1ContentId,
          questions: [
            {
              questionText: "O que você já sabe sobre este tema?",
              questionType: "open",
              options: null,
              correctAnswer: "",
              points: 1,
              tags: ["diagnostico"],
            },
            {
              questionText:
                "Marque a alternativa que melhor descreve seu nível de confiança com o assunto.",
              questionType: "multiple_choice_single",
              options: [
                "Nunca vi esse conteúdo",
                "Já vi, mas não lembro bem",
                "Conheço razoavelmente",
                "Domino bem o conteúdo",
              ],
              // Correta é índice 0, mas para gerar recomendação basta responder errado.
              correctAnswer: "0",
              points: 1,
              tags: ["autopercepcao"],
            },
          ],
        },
        {
          title: "Avaliação de Frações",
          description: "Avaliação focada em frações e operações básicas.",
          grade: "7",
          level: "1",
          mainContentId: level1ContentId,
          questions: [
            {
              questionText: "Qual fração representa metade de uma pizza dividida em 8 pedaços?",
              questionType: "multiple_choice_single",
              options: ["2/8", "3/8", "4/8", "5/8"],
              correctAnswer: "2", // 4/8
              points: 1,
              tags: ["fracoes", "operacoes"],
            },
            {
              questionText: "Explique com suas palavras o que significa somar duas frações.",
              questionType: "open",
              options: null,
              correctAnswer: "",
              points: 1,
              tags: ["fracoes"],
            },
          ],
        },
        {
          title: "Avaliação de Geografia",
          description: "Avaliação sobre leitura e interpretação de mapas.",
          grade: "7",
          level: "1",
          mainContentId: level1ContentId,
          questions: [
            {
              questionText: "O que a legenda de um mapa nos ajuda a entender?",
              questionType: "open",
              options: null,
              correctAnswer: "",
              points: 1,
              tags: ["geografia", "mapas"],
            },
            {
              questionText: "Em um mapa, o símbolo de uma estrela geralmente representa:",
              questionType: "multiple_choice_single",
              options: ["Uma floresta", "A capital", "Uma montanha", "Um rio importante"],
              correctAnswer: "1",
              points: 1,
              tags: ["geografia"],
            },
          ],
        },
        {
          title: "Avaliação de História",
          description: "Avaliação sobre linha do tempo e sequência de eventos históricos.",
          grade: "7",
          level: "1",
          mainContentId: level1ContentId,
          questions: [
            {
              questionText: "Por que organizar eventos em uma linha do tempo é importante?",
              questionType: "open",
              options: null,
              correctAnswer: "",
              points: 1,
              tags: ["historia", "linha-do-tempo"],
            },
            {
              questionText:
                "Coloque em ordem cronológica: (A) Independência do Brasil, (B) Descobrimento do Brasil, (C) Proclamação da República.",
              questionType: "open",
              options: null,
              correctAnswer: "B-A-C",
              points: 1,
              tags: ["historia"],
            },
          ],
        },
        {
          title: "Avaliação de Gramática",
          description: "Avaliação sobre ortografia e regras gramaticais.",
          grade: "7",
          level: "1",
          mainContentId: level1ContentId,
          questions: [
            {
              questionText:
                "Assinale a alternativa em que todas as palavras estão escritas corretamente.",
              questionType: "multiple_choice_single",
              options: [
                "exceção, necessário, consequencia",
                "excessão, nescessário, consequência",
                "exceção, necessário, consequência",
                "excessão, necessário, consequencia",
              ],
              correctAnswer: "2",
              points: 1,
              tags: ["gramatica", "ortografia"],
            },
            {
              questionText: "Explique com suas palavras o que é um sujeito na frase.",
              questionType: "open",
              options: null,
              correctAnswer: "",
              points: 1,
              tags: ["gramatica"],
            },
          ],
        },
      ];

      for (const seed of assessmentSeeds) {
        const existing = await prisma.assessment.findFirst({
          where: {
            title: seed.title,
            categoryId: firstCategoryId,
            grade: seed.grade,
            level: seed.level,
          },
        });

        if (existing) continue;

        const assessment = await prisma.assessment.create({
          data: {
            title: seed.title,
            description: seed.description,
            categoryId: firstCategoryId,
            grade: seed.grade,
            level: seed.level,
            contentId: seed.mainContentId,
            teacherId: teacherUser.id,
            minScore: 70,
            startDate: new Date(),
            isActive: true,
          },
        });

        await prisma.question.createMany({
          data: seed.questions.map((q, index) => ({
            assessmentId: assessment.id,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            tags: q.tags,
            orderNumber: index + 1,
          })) as never,
          skipDuplicates: true,
        });
      }

      process.stdout.write("5 avaliações de exemplo criadas com questões.\n");
    }

    // Recomendações iniciais para o aluno de teste em todos os conteúdos de reforço
    const reforcoContents = await prisma.content.findMany({
      where: {
        categoryId: firstCategoryId,
        grade: studentUser.currentGrade ?? "7",
        level: "reforco",
        isActive: true,
      },
      select: { id: true, title: true, tags: true },
    });

    let createdRecommendations = 0;
    for (const content of reforcoContents) {
      const existing = await prisma.recommendation.findFirst({
        where: {
          studentId: studentUser.id,
          contentId: content.id,
          status: "pending",
        },
      });
      if (existing) continue;

      await prisma.recommendation.create({
        data: {
          studentId: studentUser.id,
          contentId: content.id,
          reason: "Seed: recomendação inicial para teste da tela de recomendações.",
          sourceType: "seed",
          sourceId: null,
          status: "pending",
        },
      });
      createdRecommendations++;
    }

    if (createdRecommendations > 0) {
      process.stdout.write(
        `Recomendações iniciais criadas para o aluno de teste: ${createdRecommendations}\n`
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
