import type { PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "@shared/errors/AppError.js";
import { PROGRESS_STATUSES, type ProgressStatus } from "./types.js";
import type { UpsertProgressInput } from "./types.js";

function isProgressStatus(value: string): value is ProgressStatus {
  return (PROGRESS_STATUSES as readonly string[]).includes(value);
}

export class ProgressService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cria ou atualiza o progresso do aluno em um conteúdo.
   * Valida: aluno só altera próprio progresso (chamador garante);
   * conteúdo acessível: mesma série, ativo, e nível <= nível do aluno na matéria.
   */
  async upsert(studentId: string, input: UpsertProgressInput): Promise<unknown> {
    if (!isProgressStatus(input.status)) {
      throw new AppError("Invalid status", 400, "VALIDATION_ERROR");
    }

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) {
      throw new AppError("Student has no grade set", 400, "VALIDATION_ERROR");
    }

    const content = await this.prisma.content.findUnique({
      where: { id: input.contentId },
      select: { id: true, grade: true, level: true, isActive: true, categoryId: true },
    });
    if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
    if (content.grade !== student.currentGrade) {
      throw new AppError("Content is not for your grade", 403, "FORBIDDEN");
    }
    if (!content.isActive) {
      throw new AppError("Content is not available", 403, "FORBIDDEN");
    }

    if (input.status === "in_progress" || input.status === "completed") {
      const studentLevelRow = await this.prisma.studentLearningLevel.findUnique({
        where: { studentId_categoryId: { studentId, categoryId: content.categoryId } },
      });
      const studentLevel = studentLevelRow?.level ?? "1";
      const studentLevelNum = parseInt(studentLevel, 10) || 1;
      const contentLevelNum = parseInt(content.level, 10) || 1;
      if (content.level === "reforco") {
        // Reforço: permitir marcar como acessível (nível do aluno já cobre)
        if (studentLevelNum < 3) {
          throw new AppError(
            "Content level is not yet accessible for your current level",
            403,
            "FORBIDDEN"
          );
        }
      } else if (contentLevelNum > studentLevelNum) {
        throw new AppError(
          "Content level is not yet accessible for your current level",
          403,
          "FORBIDDEN"
        );
      }
    }

    const now = new Date();
    const existing = await this.prisma.studentProgress.findUnique({
      where: {
        studentId_contentId: { studentId, contentId: input.contentId },
      },
    });

    const data: {
      status: string;
      startedAt?: Date | null;
      completedAt?: Date | null;
      timeSpent?: number | null;
    } = {
      status: input.status,
    };
    if (input.status === "in_progress") {
      data.startedAt = existing?.startedAt ?? now;
    }
    if (input.status === "completed") {
      data.completedAt = now;
      data.startedAt = existing?.startedAt ?? now;
      if (input.timeSpent !== undefined) data.timeSpent = input.timeSpent;
    }
    if (input.status === "not_started") {
      data.startedAt = null;
      data.completedAt = null;
      data.timeSpent = null;
    }

    const progress = await this.prisma.studentProgress.upsert({
      where: {
        studentId_contentId: { studentId, contentId: input.contentId },
      },
      create: {
        studentId,
        contentId: input.contentId,
        status: data.status,
        startedAt: data.startedAt ?? undefined,
        completedAt: data.completedAt ?? undefined,
        timeSpent: data.timeSpent ?? undefined,
      },
      update: data,
    });
    return this.toProgressDto(progress);
  }

  /**
   * Lista o progresso do aluno por matéria: trilha da série com status de cada conteúdo,
   * percentual concluído e nível atual.
   */
  async listByCategory(studentId: string, categoryId: string): Promise<unknown> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) {
      throw new AppError("Student has no grade set", 400, "VALIDATION_ERROR");
    }

    const path = await this.prisma.learningPath.findFirst({
      where: {
        categoryId,
        grade: student.currentGrade,
        isDefault: true,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true } },
        contents: {
          orderBy: { orderNumber: "asc" },
          include: {
            content: {
              select: { id: true, title: true, level: true },
            },
          },
        },
      },
    });
    if (!path) {
      throw new AppError("No default path for this subject and grade", 404, "NOT_FOUND");
    }

    const studentLevelRow = await this.prisma.studentLearningLevel.findUnique({
      where: { studentId_categoryId: { studentId, categoryId } },
    });
    const currentLevel = studentLevelRow?.level ?? "1";
    const studentLevelNum = parseInt(currentLevel, 10) || 1;

    const progressRows = await this.prisma.studentProgress.findMany({
      where: {
        studentId,
        contentId: { in: path.contents.map((c) => c.contentId) },
      },
    });
    const progressMap = new Map(
      progressRows.map((p) => [p.contentId, { status: p.status, completedAt: p.completedAt }])
    );

    const totalContents = path.contents.length;
    let completedCount = 0;
    const contentsWithStatus = path.contents.map((pc) => {
      const prog = progressMap.get(pc.contentId);
      const status = prog?.status ?? "not_started";
      if (status === "completed") completedCount++;
      const levelNum = parseInt(pc.content.level, 10) || 1;
      let displayStatus: "blocked" | "available" | "completed" = status as "completed";
      if (status !== "completed") {
        displayStatus = levelNum > studentLevelNum ? "blocked" : "available";
      }
      return {
        contentId: pc.content.id,
        title: pc.content.title,
        level: pc.content.level,
        status: displayStatus,
        progressStatus: status,
        completedAt: prog?.completedAt ?? null,
      };
    });

    const percentage = totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0;

    return {
      categoryId: path.categoryId,
      category: path.category,
      grade: path.grade,
      pathId: path.id,
      pathName: path.name,
      currentLevel,
      totalContents,
      completedCount,
      percentage,
      contents: contentsWithStatus,
    };
  }

  /**
   * Verifica se a avaliação do nível está disponível: todos os conteúdos desse nível
   * na trilha (matéria + série do aluno) devem estar com status completed.
   * Usado na Parte 7 para liberar avaliação.
   */
  async isAssessmentAvailable(
    studentId: string,
    categoryId: string,
    level: string
  ): Promise<boolean> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) return false;

    const path = await this.prisma.learningPath.findFirst({
      where: {
        categoryId,
        grade: student.currentGrade,
        isDefault: true,
        isActive: true,
      },
      include: {
        contents: {
          where: { content: { level } },
          select: { contentId: true },
        },
      },
    });
    if (!path || path.contents.length === 0) return true; // sem conteúdos desse nível → disponível

    const contentIds = path.contents.map((c) => c.contentId);
    const completed = await this.prisma.studentProgress.count({
      where: {
        studentId,
        contentId: { in: contentIds },
        status: "completed",
      },
    });
    return completed === contentIds.length;
  }

  private toProgressDto(p: {
    id: string;
    studentId: string;
    contentId: string;
    status: string;
    startedAt: Date | null;
    completedAt: Date | null;
    timeSpent: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): unknown {
    return {
      id: p.id,
      studentId: p.studentId,
      contentId: p.contentId,
      status: p.status,
      startedAt: p.startedAt,
      completedAt: p.completedAt,
      timeSpent: p.timeSpent,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
