import type { PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "@shared/errors/AppError.js";
import type { ListRecommendationsFilters, UpdateRecommendationStatusInput } from "./types.js";
import { RECOMMENDATION_STATUSES, type RecommendationStatus } from "./types.js";

function isRecommendationStatus(value: string): value is RecommendationStatus {
  return (RECOMMENDATION_STATUSES as readonly string[]).includes(value);
}

/** Normalizes tags (JSON) to lowercase string array. */
function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

export class RecommendationService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Generates recommendations from wrong answers. Extracts tags from wrong questions;
   * finds contents with level = 'reforco', same subject and grade, at least one tag in common;
   * creates tb_recommendation (source_type: 'assessment', source_id: assessmentResultId).
   */
  async generateFromWrongQuestions(
    studentId: string,
    assessmentId: string,
    assessmentResultId: string,
    wrongQuestionIds: string[]
  ): Promise<{ count: number }> {
    if (wrongQuestionIds.length === 0) return { count: 0 };

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) return { count: 0 };

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      select: { categoryId: true },
    });
    if (!assessment) return { count: 0 };

    const questions = await this.prisma.question.findMany({
      where: { id: { in: wrongQuestionIds } },
      select: { tags: true },
    });
    const tagSet = new Set<string>();
    for (const q of questions) {
      for (const t of normalizeTags(q.tags)) tagSet.add(t);
    }
    if (tagSet.size === 0) return { count: 0 };

    const contents = await this.prisma.content.findMany({
      where: {
        categoryId: assessment.categoryId,
        grade: student.currentGrade,
        level: "reforco",
        isActive: true,
      },
      select: { id: true, title: true, tags: true },
    });

    const tagArray = Array.from(tagSet);
    const reasonPrefix =
      tagArray.length > 0
        ? `Difficulty in: ${tagArray.join(", ")}`
        : "Recommended based on assessment results";

    let created = 0;
    for (const content of contents) {
      const contentTags = normalizeTags(content.tags);
      const hasMatch = contentTags.some((t) => tagSet.has(t));
      if (!hasMatch) continue;

      const existing = await this.prisma.recommendation.findFirst({
        where: {
          studentId,
          contentId: content.id,
          status: "pending",
        },
      });
      if (existing) continue;

      await this.prisma.recommendation.create({
        data: {
          studentId,
          contentId: content.id,
          reason: reasonPrefix,
          sourceType: "assessment",
          sourceId: assessmentResultId,
          status: "pending",
        },
      });
      created++;
    }
    return { count: created };
  }

  /** Lists student recommendations with optional status filter. */
  async listByStudent(
    studentId: string,
    filters: ListRecommendationsFilters
  ): Promise<{ recommendations: unknown[] }> {
    const where: { studentId: string; status?: string } = { studentId };
    if (filters.status != null && isRecommendationStatus(filters.status)) {
      where.status = filters.status;
    }

    const recommendations = await this.prisma.recommendation.findMany({
      where,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            category: { select: { id: true, name: true } },
            grade: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      recommendations: recommendations.map((r) => ({
        id: r.id,
        contentId: r.contentId,
        content: r.content,
        reason: r.reason,
        sourceType: r.sourceType,
        sourceId: r.sourceId,
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };
  }

  /** Updates recommendation status (completed or dismissed). Only the owning student can update. */
  async updateStatus(
    recommendationId: string,
    studentId: string,
    input: UpdateRecommendationStatusInput
  ): Promise<unknown> {
    if (input.status !== "completed" && input.status !== "dismissed") {
      throw new AppError("Invalid status; use completed or dismissed", 400, "VALIDATION_ERROR");
    }

    const recommendation = await this.prisma.recommendation.findUnique({
      where: { id: recommendationId },
      include: { content: { select: { id: true, title: true } } },
    });
    if (!recommendation) throw new AppError("Recommendation not found", 404, "NOT_FOUND");
    if (recommendation.studentId !== studentId) {
      throw new AppError("You can only update your own recommendations", 403, "FORBIDDEN");
    }

    const updated = await this.prisma.recommendation.update({
      where: { id: recommendationId },
      data: { status: input.status },
      include: { content: { select: { id: true, title: true } } },
    });
    return {
      id: updated.id,
      contentId: updated.contentId,
      content: updated.content,
      reason: updated.reason,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }
}
