import type { PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "@shared/errors/AppError.js";
import { isGrade } from "@shared/constants/grades.js";
import { isTrilhaLevel } from "@shared/constants/contentLevels.js";
import type {
  CreateLearningPathInput,
  UpdateLearningPathInput,
  ListLearningPathsFilters,
  AddContentToPathInput,
  ReorderPathContentsInput,
} from "./types.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class LearningPathService {
  constructor(private readonly prisma: PrismaClient) {}

  private async teacherTeachesCategory(teacherId: string, categoryId: string): Promise<boolean> {
    const ts = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_categoryId: { teacherId, categoryId } },
    });
    return ts != null;
  }

  private async ensureCanManagePath(
    categoryId: string,
    userId: string,
    role: string
  ): Promise<void> {
    if (role === "coordinator") return;
    if (role === "teacher") {
      const can = await this.teacherTeachesCategory(userId, categoryId);
      if (!can) throw new AppError("You can only manage paths for subjects you teach", 403);
      return;
    }
    throw new AppError("Forbidden", 403);
  }

  private async ensureAtMostOneDefault(
    categoryId: string,
    grade: string,
    excludePathId?: string
  ): Promise<void> {
    const where: { categoryId: string; grade: string; isDefault: boolean; id?: { not: string } } = {
      categoryId,
      grade,
      isDefault: true,
    };
    if (excludePathId) where.id = { not: excludePathId };
    const existing = await this.prisma.learningPath.findFirst({ where });
    if (existing) {
      await this.prisma.learningPath.update({
        where: { id: existing.id },
        data: { isDefault: false },
      });
    }
  }

  async create(
    input: CreateLearningPathInput,
    userId: string,
    role: string
  ): Promise<{ id: string; name: string }> {
    await this.ensureCanManagePath(input.categoryId, userId, role);
    if (!isGrade(input.grade)) throw new AppError("Invalid grade", 400, "VALIDATION_ERROR");

    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new AppError("Category not found", 404, "NOT_FOUND");

    if (input.isDefault === true) {
      await this.ensureAtMostOneDefault(input.categoryId, input.grade);
    }

    const path = await this.prisma.learningPath.create({
      data: {
        name: input.name,
        categoryId: input.categoryId,
        grade: input.grade,
        isDefault: input.isDefault ?? true,
        description: input.description ?? null,
        createdBy: userId,
      },
    });
    return { id: path.id, name: path.name };
  }

  async getById(id: string, userId: string, role: string): Promise<unknown> {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        contents: {
          orderBy: { orderNumber: "asc" },
          include: { content: { select: { id: true, title: true, level: true } } },
        },
      },
    });
    if (!path) throw new AppError("Learning path not found", 404, "NOT_FOUND");
    await this.ensureCanManagePath(path.categoryId, userId, role);
    return this.toPathDto(path);
  }

  async list(
    filters: ListLearningPathsFilters,
    userId: string,
    role: string
  ): Promise<{ paths: unknown[]; total: number }> {
    const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    type PathWhere = { categoryId?: string | { in: string[] }; grade?: string };
    const where: PathWhere = {};
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.grade) where.grade = filters.grade;

    if (role === "teacher") {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId },
        select: { categoryId: true },
      });
      const categoryIds = teacherSubjects.map((ts: { categoryId: string }) => ts.categoryId);
      if (categoryIds.length === 0) return { paths: [], total: 0 };
      const currentCat = where.categoryId;
      if (typeof currentCat === "string" && !categoryIds.includes(currentCat)) {
        return { paths: [], total: 0 };
      }
      if (typeof currentCat !== "string") where.categoryId = { in: categoryIds };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- where shape matches Prisma
    const prismaWhere = where as any;
    const [paths, total] = await Promise.all([
      this.prisma.learningPath.findMany({
        where: prismaWhere,
        skip,
        take: limit,
        orderBy: [{ grade: "asc" }, { name: "asc" }],
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.learningPath.count({ where: prismaWhere }),
    ]);
    return { paths: paths.map((p) => this.toPathSummaryDto(p)), total };
  }

  async update(
    id: string,
    input: UpdateLearningPathInput,
    userId: string,
    role: string
  ): Promise<{ id: string; name: string }> {
    const path = await this.prisma.learningPath.findUnique({ where: { id } });
    if (!path) throw new AppError("Learning path not found", 404, "NOT_FOUND");
    await this.ensureCanManagePath(path.categoryId, userId, role);

    if (input.isDefault === true) {
      await this.ensureAtMostOneDefault(path.categoryId, path.grade, id);
    }

    const updated = await this.prisma.learningPath.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
    return { id: updated.id, name: updated.name };
  }

  async addContent(
    pathId: string,
    input: AddContentToPathInput,
    userId: string,
    role: string
  ): Promise<void> {
    const path = await this.prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) throw new AppError("Learning path not found", 404, "NOT_FOUND");
    await this.ensureCanManagePath(path.categoryId, userId, role);

    const content = await this.prisma.content.findUnique({
      where: { id: input.contentId },
    });
    if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
    if (content.categoryId !== path.categoryId || content.grade !== path.grade) {
      throw new AppError(
        "Content must have same category and grade as the path",
        400,
        "VALIDATION_ERROR"
      );
    }
    if (!isTrilhaLevel(content.level)) {
      throw new AppError(
        "Only content with level 1, 2 or 3 can be added to the path (reforço not allowed)",
        400,
        "VALIDATION_ERROR"
      );
    }

    const existing = await this.prisma.learningPathContent.findFirst({
      where: { learningPathId: pathId, contentId: input.contentId },
    });
    if (existing) throw new AppError("Content already in path", 400, "VALIDATION_ERROR");

    const existingAtOrder = await this.prisma.learningPathContent.findMany({
      where: { learningPathId: pathId, orderNumber: { gte: input.orderNumber } },
      orderBy: { orderNumber: "desc" },
    });
    for (const row of existingAtOrder) {
      await this.prisma.learningPathContent.update({
        where: { id: row.id },
        data: { orderNumber: row.orderNumber + 1 },
      });
    }

    await this.prisma.learningPathContent.create({
      data: {
        learningPathId: pathId,
        contentId: input.contentId,
        orderNumber: input.orderNumber,
      },
    });
  }

  async removeContent(
    pathId: string,
    contentId: string,
    userId: string,
    role: string
  ): Promise<void> {
    const path = await this.prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) throw new AppError("Learning path not found", 404, "NOT_FOUND");
    await this.ensureCanManagePath(path.categoryId, userId, role);

    const link = await this.prisma.learningPathContent.findFirst({
      where: { learningPathId: pathId, contentId },
    });
    if (!link) throw new AppError("Content not in path", 404, "NOT_FOUND");

    await this.prisma.learningPathContent.delete({
      where: { id: link.id },
    });
    const after = await this.prisma.learningPathContent.findMany({
      where: { learningPathId: pathId, orderNumber: { gt: link.orderNumber } },
      orderBy: { orderNumber: "asc" },
    });
    for (const row of after) {
      await this.prisma.learningPathContent.update({
        where: { id: row.id },
        data: { orderNumber: row.orderNumber - 1 },
      });
    }
  }

  async reorderContents(
    pathId: string,
    input: ReorderPathContentsInput,
    userId: string,
    role: string
  ): Promise<void> {
    const path = await this.prisma.learningPath.findUnique({ where: { id: pathId } });
    if (!path) throw new AppError("Learning path not found", 404, "NOT_FOUND");
    await this.ensureCanManagePath(path.categoryId, userId, role);

    const pathContentIds = await this.prisma.learningPathContent.findMany({
      where: { learningPathId: pathId },
      select: { contentId: true },
    });
    const pathContentIdSet = new Set(pathContentIds.map((r) => r.contentId));
    for (const item of input.items) {
      if (!pathContentIdSet.has(item.contentId)) {
        throw new AppError(
          `Content ${item.contentId} is not in this path`,
          400,
          "VALIDATION_ERROR"
        );
      }
    }

    for (const item of input.items) {
      const row = await this.prisma.learningPathContent.findFirst({
        where: { learningPathId: pathId, contentId: item.contentId },
      });
      if (row) {
        await this.prisma.learningPathContent.update({
          where: { id: row.id },
          data: { orderNumber: item.orderNumber },
        });
      }
    }
  }

  async getForStudent(categoryId: string, studentId: string): Promise<unknown> {
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
    if (!path) throw new AppError("No default path for this subject and grade", 404, "NOT_FOUND");

    const studentLevelRow = await this.prisma.studentLearningLevel.findUnique({
      where: { studentId_categoryId: { studentId, categoryId } },
    });
    const studentLevel = studentLevelRow?.level ?? "1";
    const studentLevelNum = parseInt(studentLevel, 10) || 1;

    const progressMap = new Map<string, string>();
    const progressRows = await this.prisma.studentProgress.findMany({
      where: {
        studentId,
        contentId: { in: path.contents.map((c) => c.contentId) },
      },
    });
    for (const p of progressRows) {
      progressMap.set(p.contentId, p.status);
    }

    const contentsWithStatus = path.contents.map((pc) => {
      const levelNum = parseInt(pc.content.level, 10) || 1;
      let status: "blocked" | "available" | "completed";
      const progressStatus = progressMap.get(pc.contentId);
      if (progressStatus === "completed") status = "completed";
      else if (levelNum > studentLevelNum) status = "blocked";
      else status = "available";
      return {
        contentId: pc.contentId,
        orderNumber: pc.orderNumber,
        title: pc.content.title,
        level: pc.content.level,
        status,
      };
    });

    return {
      id: path.id,
      name: path.name,
      categoryId: path.categoryId,
      category: path.category,
      grade: path.grade,
      description: path.description,
      contents: contentsWithStatus,
    };
  }

  private toPathDto(path: {
    id: string;
    name: string;
    categoryId: string;
    grade: string;
    isDefault: boolean;
    description: string | null;
    createdBy: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    category?: { id: string; name: string };
    contents?: Array<{
      orderNumber: number;
      content: { id: string; title: string; level: string };
    }>;
  }): unknown {
    return {
      id: path.id,
      name: path.name,
      categoryId: path.categoryId,
      category: path.category,
      grade: path.grade,
      isDefault: path.isDefault,
      description: path.description,
      createdBy: path.createdBy,
      isActive: path.isActive,
      createdAt: path.createdAt,
      updatedAt: path.updatedAt,
      contents: path.contents?.map((pc) => ({
        contentId: pc.content.id,
        orderNumber: pc.orderNumber,
        title: pc.content.title,
        level: pc.content.level,
      })),
    };
  }

  private toPathSummaryDto(path: {
    id: string;
    name: string;
    categoryId: string;
    grade: string;
    isDefault: boolean;
    description: string | null;
    category?: { id: string; name: string };
  }): unknown {
    return {
      id: path.id,
      name: path.name,
      categoryId: path.categoryId,
      category: path.category,
      grade: path.grade,
      isDefault: path.isDefault,
      description: path.description,
    };
  }
}
