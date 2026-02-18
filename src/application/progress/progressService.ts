import { AppError } from "@shared/errors/AppError.js";
import type { PrismaClient } from "../../generated/prisma/client.js";
import type { UpsertProgressInput } from "./types.js";
import { PROGRESS_STATUSES, type ProgressStatus } from "./types.js";

function isProgressStatus(value: string): value is ProgressStatus {
  return (PROGRESS_STATUSES as readonly string[]).includes(value);
}

export class ProgressService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Creates or updates student progress on a content. Validates: student only updates own progress;
   * content accessible: same grade, active, and level <= student level in subject.
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
        const recommendation = await this.prisma.recommendation.findFirst({
          where: {
            studentId,
            contentId: content.id,
            status: { in: ["pending", "completed"] },
          },
        });
        if (!recommendation) {
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
    // After successfully updating progress, try to promote the student's level for this subject
    if (input.status === "completed") {
      // Best effort: if this fails we still return the progress normally
      await this.maybePromoteStudentLevel(studentId, content.categoryId, student.currentGrade);
    }
    return this.toProgressDto(progress);
  }

  /**
   * Lists student progress by subject: path for grade with status per content,
   * completion percentage and current level.
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
   * Checks if assessment for level is available: all contents of that level in the path
   * (subject + student grade) must be completed.
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
    if (!path || path.contents.length === 0) return false;

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

  /**
   * Promotes the student's level for a subject (category) when all contents
   * of the current level in the default active learning path for that grade
   * are completed.
   *
   * This keeps StudentLearningLevel.level in sync with actual progress so
   * that higher-level contents become available.
   */
  private async maybePromoteStudentLevel(
    studentId: string,
    categoryId: string,
    grade: string
  ): Promise<void> {
    // Find the default active learning path for this subject and grade
    const path = await this.prisma.learningPath.findFirst({
      where: {
        categoryId,
        grade,
        isDefault: true,
        isActive: true,
      },
      include: {
        contents: {
          orderBy: { orderNumber: "asc" },
          include: {
            content: {
              select: { id: true, level: true },
            },
          },
        },
      },
    });

    if (!path || path.contents.length === 0) {
      return;
    }

    // Current student level for this subject (defaults to "1")
    const studentLevelRow = await this.prisma.studentLearningLevel.findUnique({
      where: { studentId_categoryId: { studentId, categoryId } },
    });
    const currentLevel = studentLevelRow?.level ?? "1";
    const currentLevelNum = parseInt(currentLevel, 10) || 1;

    // Determine the maximum numeric level defined in the path (ignoring "reforco" and non-numeric levels)
    const numericLevels = path.contents
      .map((pc) => parseInt(pc.content.level, 10))
      .filter((n) => !Number.isNaN(n));
    if (numericLevels.length === 0) {
      return;
    }
    const maxLevelNum = Math.max(...numericLevels);

    // If already at or above the max level, nothing to promote
    if (currentLevelNum >= maxLevelNum) {
      return;
    }

    // All contents for the current level in this path
    const levelContents = path.contents.filter((pc) => {
      const levelNum = parseInt(pc.content.level, 10);
      return !Number.isNaN(levelNum) && levelNum === currentLevelNum;
    });

    if (levelContents.length === 0) {
      return;
    }

    const contentIds = levelContents.map((pc) => pc.content.id);

    // How many of these contents the student has completed
    const completedCount = await this.prisma.studentProgress.count({
      where: {
        studentId,
        contentId: { in: contentIds },
        status: "completed",
      },
    });

    // Only promote if all contents of the current level are completed
    if (completedCount !== contentIds.length) {
      return;
    }

    const nextLevel = String(currentLevelNum + 1);

    await this.prisma.studentLearningLevel.upsert({
      where: { studentId_categoryId: { studentId, categoryId } },
      create: {
        studentId,
        categoryId,
        level: nextLevel,
      },
      update: {
        level: nextLevel,
      },
    });
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
