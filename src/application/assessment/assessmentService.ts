import { ProgressService } from "@application/progress/progressService.js";
import { RecommendationService } from "@application/recommendation/recommendationService.js";
import { isTrilhaLevel } from "@shared/constants/contentLevels.js";
import { isGrade } from "@shared/constants/grades.js";
import { AppError } from "@shared/errors/AppError.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import type {
  CreateAssessmentInput,
  CreateQuestionInput,
  ListAssessmentsFilters,
  SubmitAssessmentInput,
  UpdateAssessmentInput,
  UpdateQuestionInput,
} from "./types.js";
import { QUESTION_TYPES, type QuestionType } from "./types.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function isQuestionType(value: string): value is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(value);
}

function normalizeAnswer(text: string): string {
  return text.trim().toLowerCase();
}

export class AssessmentService {
  private progressService: ProgressService;
  private recommendationService: RecommendationService;

  constructor(private readonly prisma: PrismaClient) {
    this.progressService = new ProgressService(prisma);
    this.recommendationService = new RecommendationService(prisma);
  }

  private async teacherTeachesCategory(teacherId: string, categoryId: string): Promise<boolean> {
    const ts = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_categoryId: { teacherId, categoryId } },
    });
    return ts != null;
  }

  private async ensureCanManageAssessment(
    categoryId: string,
    userId: string,
    role: string
  ): Promise<void> {
    if (role === "coordinator") return;
    if (role === "teacher") {
      const can = await this.teacherTeachesCategory(userId, categoryId);
      if (!can) throw new AppError("You can only manage assessments for subjects you teach", 403);
      return;
    }
    throw new AppError("Forbidden", 403);
  }

  async createAssessment(
    input: CreateAssessmentInput,
    userId: string,
    role: string
  ): Promise<{ id: string; title: string }> {
    await this.ensureCanManageAssessment(input.categoryId, userId, role);
    if (!isTrilhaLevel(input.level)) {
      throw new AppError("Invalid level; use 1, 2 or 3", 400, "VALIDATION_ERROR");
    }
    if (!isGrade(input.grade)) {
      throw new AppError("Invalid grade", 400, "VALIDATION_ERROR");
    }

    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new AppError("Category not found", 404, "NOT_FOUND");

    const startDate = new Date(input.startDate);
    const endDate = input.endDate ? new Date(input.endDate) : null;
    if (isNaN(startDate.getTime()))
      throw new AppError("Invalid startDate", 400, "VALIDATION_ERROR");
    if (endDate !== null && isNaN(endDate.getTime())) {
      throw new AppError("Invalid endDate", 400, "VALIDATION_ERROR");
    }

    const assessment = await this.prisma.assessment.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        categoryId: input.categoryId,
        grade: input.grade,
        level: input.level,
        teacherId: userId,
        minScore: input.minScore ?? 70,
        startDate,
        endDate,
      },
    });
    return { id: assessment.id, title: assessment.title };
  }

  async getAssessmentById(id: string, userId: string, role: string): Promise<unknown> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        questions: { orderBy: { orderNumber: "asc" } },
      },
    });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");

    if (role === "student") {
      throw new AppError("Use list available assessments for student", 403, "FORBIDDEN");
    }
    await this.ensureCanManageAssessment(assessment.categoryId, userId, role);
    return this.toAssessmentDto(assessment);
  }

  async listAssessments(
    filters: ListAssessmentsFilters,
    userId: string,
    role: string
  ): Promise<{ assessments: unknown[]; total: number }> {
    const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const where: Prisma.AssessmentWhereInput = {};
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.grade) where.grade = filters.grade;
    if (filters.level) where.level = filters.level;

    if (role === "teacher") {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId },
        select: { categoryId: true },
      });
      const categoryIds = teacherSubjects.map((ts: { categoryId: string }) => ts.categoryId);
      if (categoryIds.length === 0) return { assessments: [], total: 0 };
      const currentCat = where.categoryId;
      if (typeof currentCat === "string" && !categoryIds.includes(currentCat)) {
        return { assessments: [], total: 0 };
      }
      if (typeof currentCat !== "string") where.categoryId = { in: categoryIds };
    }

    const [assessments, total] = await Promise.all([
      this.prisma.assessment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ startDate: "desc" }],
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.assessment.count({ where }),
    ]);
    return {
      assessments: assessments.map((a) => this.toAssessmentSummaryDto(a)),
      total,
    };
  }

  async updateAssessment(
    id: string,
    input: UpdateAssessmentInput,
    userId: string,
    role: string
  ): Promise<{ id: string; title: string }> {
    const assessment = await this.prisma.assessment.findUnique({ where: { id } });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");
    await this.ensureCanManageAssessment(assessment.categoryId, userId, role);

    const data: {
      title?: string;
      description?: string | null;
      minScore?: number;
      startDate?: Date;
      endDate?: Date | null;
      isActive?: boolean;
    } = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.minScore !== undefined) data.minScore = input.minScore;
    if (input.startDate !== undefined) data.startDate = new Date(input.startDate);
    if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const updated = await this.prisma.assessment.update({
      where: { id },
      data,
    });
    return { id: updated.id, title: updated.title };
  }

  private async ensureCanManageQuestion(
    questionId: string,
    userId: string,
    role: string
  ): Promise<void> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { assessment: { select: { categoryId: true } } },
    });
    if (!question) throw new AppError("Question not found", 404, "NOT_FOUND");
    await this.ensureCanManageAssessment(question.assessment.categoryId, userId, role);
  }

  async createQuestion(
    assessmentId: string,
    input: CreateQuestionInput,
    userId: string,
    role: string
  ): Promise<{ id: string; questionText: string }> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");
    await this.ensureCanManageAssessment(assessment.categoryId, userId, role);
    if (!isQuestionType(input.questionType)) {
      throw new AppError("Invalid questionType", 400, "VALIDATION_ERROR");
    }

    const question = await this.prisma.question.create({
      data: {
        assessmentId,
        questionText: input.questionText,
        questionType: input.questionType,
        options: input.options as object | undefined,
        correctAnswer: input.correctAnswer,
        points: input.points ?? 1,
        tags: input.tags as object | undefined,
        orderNumber: input.orderNumber,
      },
    });
    return { id: question.id, questionText: question.questionText };
  }

  async listQuestions(assessmentId: string, userId: string, role: string): Promise<unknown[]> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { orderNumber: "asc" } } },
    });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");
    await this.ensureCanManageAssessment(assessment.categoryId, userId, role);
    return assessment.questions.map((q) => this.toQuestionDto(q));
  }

  async updateQuestion(
    questionId: string,
    input: UpdateQuestionInput,
    userId: string,
    role: string
  ): Promise<{ id: string; questionText: string }> {
    await this.ensureCanManageQuestion(questionId, userId, role);
    const data: {
      questionText?: string;
      questionType?: string;
      options?: object;
      correctAnswer?: string;
      points?: number;
      tags?: object;
      orderNumber?: number;
    } = {};
    if (input.questionText !== undefined) data.questionText = input.questionText;
    if (input.questionType !== undefined) data.questionType = input.questionType;
    if (input.options !== undefined) data.options = input.options as object;
    if (input.correctAnswer !== undefined) data.correctAnswer = input.correctAnswer;
    if (input.points !== undefined) data.points = input.points;
    if (input.tags !== undefined) data.tags = input.tags as object;
    if (input.orderNumber !== undefined) data.orderNumber = input.orderNumber;

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data,
    });
    return { id: updated.id, questionText: updated.questionText };
  }

  async deleteQuestion(questionId: string, userId: string, role: string): Promise<void> {
    await this.ensureCanManageQuestion(questionId, userId, role);
    await this.prisma.question.delete({ where: { id: questionId } });
  }

  async listAvailableForStudent(studentId: string): Promise<unknown[]> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) return [];

    const levels = await this.prisma.studentLearningLevel.findMany({
      where: { studentId },
      select: { categoryId: true, level: true },
    });
    const now = new Date();
    const result: unknown[] = [];

    for (const row of levels) {
      const levelNum = parseInt(row.level, 10) || 1;
      for (let l = 1; l <= levelNum; l++) {
        const levelStr = String(l);
        const available = await this.progressService.isAssessmentAvailable(
          studentId,
          row.categoryId,
          levelStr
        );
        if (!available) continue;

        const assessments = await this.prisma.assessment.findMany({
          where: {
            categoryId: row.categoryId,
            grade: student.currentGrade,
            level: levelStr,
            isActive: true,
            startDate: { lte: now },
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
          include: { category: { select: { id: true, name: true } } },
        });

        for (const a of assessments) {
          const alreadySubmitted = await this.prisma.assessmentResult.findUnique({
            where: {
              studentId_assessmentId: { studentId, assessmentId: a.id },
            },
          });
          if (alreadySubmitted) continue;
          result.push(this.toAssessmentSummaryDto(a));
        }
      }
    }
    return result;
  }

  /**
   * Returns assessment with questions for student to take (without correctAnswer).
   * Validates: assessment available for student and not yet submitted.
   */
  async getAssessmentForStudent(assessmentId: string, studentId: string): Promise<unknown> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) {
      throw new AppError("Student has no grade set", 400, "VALIDATION_ERROR");
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        category: { select: { id: true, name: true } },
        questions: { orderBy: { orderNumber: "asc" } },
      },
    });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");
    if (!assessment.isActive) throw new AppError("Assessment is not available", 403, "FORBIDDEN");
    if (assessment.grade !== student.currentGrade) {
      throw new AppError("Assessment is not for your grade", 403, "FORBIDDEN");
    }
    const now = new Date();
    const startDate = new Date(assessment.startDate);
    const endDate = assessment.endDate ? new Date(assessment.endDate) : null;
    if (now < startDate) throw new AppError("Assessment has not started yet", 403, "FORBIDDEN");
    if (endDate !== null && now > endDate) {
      throw new AppError("Assessment has ended", 403, "FORBIDDEN");
    }

    const available = await this.progressService.isAssessmentAvailable(
      studentId,
      assessment.categoryId,
      assessment.level
    );
    if (!available) {
      throw new AppError(
        "Complete all contents of this level in the path before taking the assessment",
        403,
        "FORBIDDEN"
      );
    }

    const alreadySubmitted = await this.prisma.assessmentResult.findUnique({
      where: { studentId_assessmentId: { studentId, assessmentId } },
    });
    if (alreadySubmitted) {
      throw new AppError("You have already submitted this assessment", 400, "VALIDATION_ERROR");
    }

    return {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      categoryId: assessment.categoryId,
      category: assessment.category,
      grade: assessment.grade,
      level: assessment.level,
      minScore: Number(assessment.minScore),
      startDate: assessment.startDate,
      endDate: assessment.endDate,
      questions: assessment.questions.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        points: Number(q.points),
        tags: q.tags,
        orderNumber: q.orderNumber,
      })),
    };
  }

  async submitAssessment(
    assessmentId: string,
    studentId: string,
    input: SubmitAssessmentInput
  ): Promise<unknown> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) {
      throw new AppError("Student has no grade set", 400, "VALIDATION_ERROR");
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: { orderBy: { orderNumber: "asc" } } },
    });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");
    if (!assessment.isActive) throw new AppError("Assessment is not available", 403, "FORBIDDEN");
    if (assessment.grade !== student.currentGrade) {
      throw new AppError("Assessment is not for your grade", 403, "FORBIDDEN");
    }
    const startDate = new Date(assessment.startDate);
    const endDate = assessment.endDate ? new Date(assessment.endDate) : null;
    const now = new Date();
    if (now < startDate) throw new AppError("Assessment has not started yet", 403, "FORBIDDEN");
    if (endDate !== null && now > endDate) {
      throw new AppError("Assessment has ended", 403, "FORBIDDEN");
    }

    const available = await this.progressService.isAssessmentAvailable(
      studentId,
      assessment.categoryId,
      assessment.level
    );
    if (!available) {
      throw new AppError(
        "Complete all contents of this level in the path before taking the assessment",
        403,
        "FORBIDDEN"
      );
    }

    const existing = await this.prisma.assessmentResult.findUnique({
      where: { studentId_assessmentId: { studentId, assessmentId } },
    });
    if (existing)
      throw new AppError("You have already submitted this assessment", 400, "VALIDATION_ERROR");

    const answerByQuestion = new Map(input.answers.map((a) => [a.questionId, a.answerText]));
    let totalScore = 0;
    const maxScore = assessment.questions.reduce((sum, q) => sum + Number(q.points), 0);
    const wrongQuestionIds: string[] = [];

    for (const q of assessment.questions) {
      const answerText = answerByQuestion.get(q.id) ?? "";
      const correctNorm = normalizeAnswer(q.correctAnswer);
      const studentNorm = normalizeAnswer(answerText);
      const isCorrect = correctNorm === studentNorm;
      const pointsEarned = isCorrect ? Number(q.points) : 0;
      totalScore += pointsEarned;
      if (!isCorrect) wrongQuestionIds.push(q.id);

      await this.prisma.studentAnswer.upsert({
        where: {
          studentId_questionId: { studentId, questionId: q.id },
        },
        create: {
          studentId,
          assessmentId,
          questionId: q.id,
          answerText,
          isCorrect,
          pointsEarned,
        },
        update: {
          answerText,
          isCorrect,
          pointsEarned,
        },
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const minScoreNum = Number(assessment.minScore);
    let levelUpdated = false;
    if (percentage >= minScoreNum) {
      const currentLevelRow = await this.prisma.studentLearningLevel.findUnique({
        where: {
          studentId_categoryId: { studentId, categoryId: assessment.categoryId },
        },
      });
      const currentLevel = currentLevelRow?.level ?? "1";
      const currentLevelNum = parseInt(currentLevel, 10) || 1;
      const assessmentLevelNum = parseInt(assessment.level, 10) || 1;
      if (assessmentLevelNum > currentLevelNum) {
        await this.prisma.studentLearningLevel.upsert({
          where: {
            studentId_categoryId: { studentId, categoryId: assessment.categoryId },
          },
          create: { studentId, categoryId: assessment.categoryId, level: assessment.level },
          update: { level: assessment.level },
        });
        levelUpdated = true;
      }
    }

    const assessmentResult = await this.prisma.assessmentResult.create({
      data: {
        studentId,
        assessmentId,
        totalScore,
        maxScore,
        percentage,
        levelUpdated,
      },
    });

    await this.generateRecommendationsAfterSubmit(
      studentId,
      assessmentId,
      assessmentResult.id,
      wrongQuestionIds
    );

    return {
      totalScore,
      maxScore,
      percentage: Math.round(percentage * 100) / 100,
      levelUpdated,
    };
  }

  /**
   * Returns detailed result of a submitted assessment: score, percentage, levelUpdated,
   * and per question: text, student answer, correct answer, isCorrect.
   */
  async getAssessmentResultForStudent(assessmentId: string, studentId: string): Promise<unknown> {
    const result = await this.prisma.assessmentResult.findUnique({
      where: { studentId_assessmentId: { studentId, assessmentId } },
    });
    if (!result) {
      throw new AppError("You have not submitted this assessment yet", 404, "NOT_FOUND");
    }

    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        category: { select: { id: true, name: true } },
        questions: { orderBy: { orderNumber: "asc" } },
      },
    });
    if (!assessment) throw new AppError("Assessment not found", 404, "NOT_FOUND");

    const studentAnswers = await this.prisma.studentAnswer.findMany({
      where: { studentId, assessmentId },
    });
    const answerByQuestionId = new Map(studentAnswers.map((a) => [a.questionId, a]));

    return {
      result: {
        totalScore: Number(result.totalScore),
        maxScore: Number(result.maxScore),
        percentage: Number(result.percentage),
        levelUpdated: result.levelUpdated,
        completedAt: result.completedAt,
      },
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        category: assessment.category,
        grade: assessment.grade,
        level: assessment.level,
      },
      questions: assessment.questions.map((q) => {
        const sa = answerByQuestionId.get(q.id);
        return {
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          points: Number(q.points),
          orderNumber: q.orderNumber,
          correctAnswer: q.correctAnswer,
          studentAnswer: sa
            ? {
                answerText: sa.answerText,
                isCorrect: sa.isCorrect,
                pointsEarned: Number(sa.pointsEarned),
              }
            : null,
        };
      }),
    };
  }

  /** Generates recommendations from wrong questions; delegates to RecommendationService. */
  private async generateRecommendationsAfterSubmit(
    studentId: string,
    assessmentId: string,
    assessmentResultId: string,
    wrongQuestionIds: string[]
  ): Promise<void> {
    await this.recommendationService.generateFromWrongQuestions(
      studentId,
      assessmentId,
      assessmentResultId,
      wrongQuestionIds
    );
  }

  private toAssessmentDto(a: {
    id: string;
    title: string;
    description: string | null;
    categoryId: string;
    grade: string | null;
    level: string;
    teacherId: string;
    minScore: unknown;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: { id: string; name: string };
    questions?: Array<{
      id: string;
      questionText: string;
      questionType: string;
      options: unknown;
      correctAnswer: string;
      points: unknown;
      tags: unknown;
      orderNumber: number;
    }>;
  }): unknown {
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      categoryId: a.categoryId,
      category: a.category,
      grade: a.grade,
      level: a.level,
      teacherId: a.teacherId,
      minScore: Number(a.minScore),
      startDate: a.startDate,
      endDate: a.endDate,
      isActive: a.isActive,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      questions: a.questions?.map((q) => ({
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        points: Number(q.points),
        tags: q.tags,
        orderNumber: q.orderNumber,
      })),
    };
  }

  private toAssessmentSummaryDto(a: {
    id: string;
    title: string;
    description: string | null;
    categoryId: string;
    grade: string | null;
    level: string;
    minScore: unknown;
    startDate: Date;
    endDate: Date | null;
    category?: { id: string; name: string };
  }): unknown {
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      categoryId: a.categoryId,
      category: a.category,
      grade: a.grade,
      level: a.level,
      minScore: Number(a.minScore),
      startDate: a.startDate,
      endDate: a.endDate,
    };
  }

  private toQuestionDto(q: {
    id: string;
    questionText: string;
    questionType: string;
    options: unknown;
    correctAnswer: string;
    points: unknown;
    tags: unknown;
    orderNumber: number;
  }): unknown {
    return {
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      points: Number(q.points),
      tags: q.tags,
      orderNumber: q.orderNumber,
    };
  }
}
