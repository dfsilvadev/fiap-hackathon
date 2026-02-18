import { isContentLevel } from "@shared/constants/contentLevels.js";
import { isGrade } from "@shared/constants/grades.js";
import { AppError } from "@shared/errors/AppError.js";
import type { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import type {
  CreateContentInput,
  ListContentsFilters,
  ListContentsForStudentFilters,
  UpdateContentInput,
} from "./types.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class ContentService {
  constructor(private readonly prisma: PrismaClient) {}

  private async teacherTeachesCategory(teacherId: string, categoryId: string): Promise<boolean> {
    const ts = await this.prisma.teacherSubject.findUnique({
      where: { teacherId_categoryId: { teacherId, categoryId } },
    });
    return ts != null;
  }

  private async ensureCanManageContent(
    contentCategoryId: string,
    userId: string,
    role: string
  ): Promise<void> {
    if (role === "coordinator") return;
    if (role === "teacher") {
      const can = await this.teacherTeachesCategory(userId, contentCategoryId);
      if (!can) throw new AppError("You can only manage content for subjects you teach", 403);
      return;
    }
    throw new AppError("Forbidden", 403);
  }

  async create(
    input: CreateContentInput,
    userId: string,
    role: string
  ): Promise<{ id: string; title: string }> {
    await this.ensureCanManageContent(input.categoryId, userId, role);

    if (!isGrade(input.grade)) throw new AppError("Invalid grade", 400, "VALIDATION_ERROR");
    if (!isContentLevel(input.level)) throw new AppError("Invalid level", 400, "VALIDATION_ERROR");

    const category = await this.prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) throw new AppError("Category not found", 404, "NOT_FOUND");

    const content = await this.prisma.content.create({
      data: {
        title: input.title,
        contentText: input.contentText,
        categoryId: input.categoryId,
        grade: input.grade,
        level: input.level,
        userId,
        topics: input.topics as object | undefined,
        glossary: input.glossary as object | undefined,
        accessibilityMetadata: input.accessibilityMetadata as object | undefined,
        tags: input.tags as object | undefined,
      },
    });
    return { id: content.id, title: content.title };
  }

  async getById(id: string, userId: string, role: string): Promise<unknown> {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");

    if (role === "student") {
      if (!content.isActive) throw new AppError("Content not found", 404, "NOT_FOUND");
      const student = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { currentGrade: true },
      });
      if (!student?.currentGrade || student.currentGrade !== content.grade) {
        throw new AppError("Content not found", 404, "NOT_FOUND");
      }
      return this.toStudentContentDto(content);
    }

    await this.ensureCanManageContent(content.categoryId, userId, role);
    return this.toContentDto(content);
  }

  async list(
    filters: ListContentsFilters,
    userId: string,
    role: string
  ): Promise<{ contents: unknown[]; total: number }> {
    const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const where: Prisma.ContentWhereInput = {};
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.grade) where.grade = filters.grade;
    if (filters.level) where.level = filters.level;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    if (role === "teacher") {
      const teacherSubjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId },
        select: { categoryId: true },
      });
      const categoryIds = teacherSubjects.map((ts: { categoryId: string }) => ts.categoryId);
      if (categoryIds.length === 0) {
        return { contents: [], total: 0 };
      }
      const currentCategoryId = where.categoryId;
      if (typeof currentCategoryId === "string") {
        if (!categoryIds.includes(currentCategoryId)) {
          return { contents: [], total: 0 };
        }
      } else {
        where.categoryId = { in: categoryIds };
      }
    }

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.content.count({ where }),
    ]);

    const dtos = contents.map((c) => this.toContentDto(c));
    return { contents: dtos, total };
  }

  async listForStudent(
    filters: ListContentsForStudentFilters,
    studentId: string
  ): Promise<{ contents: unknown[]; total: number }> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) {
      return { contents: [], total: 0 };
    }

    const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const where: { isActive: boolean; grade: string; categoryId?: string } = {
      isActive: true,
      grade: student.currentGrade,
    };
    if (filters.categoryId) where.categoryId = filters.categoryId;

    const [contents, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.content.count({ where }),
    ]);

    const dtos = contents.map((c) => this.toStudentContentDto(c));
    return { contents: dtos, total };
  }

  async update(
    id: string,
    input: UpdateContentInput,
    userId: string,
    role: string
  ): Promise<{ id: string; title: string }> {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
    await this.ensureCanManageContent(content.categoryId, userId, role);

    if (input.grade !== undefined && !isGrade(input.grade)) {
      throw new AppError("Invalid grade", 400, "VALIDATION_ERROR");
    }
    if (input.level !== undefined && !isContentLevel(input.level)) {
      throw new AppError("Invalid level", 400, "VALIDATION_ERROR");
    }

    const updated = await this.prisma.content.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.contentText !== undefined && { contentText: input.contentText }),
        ...(input.grade !== undefined && { grade: input.grade }),
        ...(input.level !== undefined && { level: input.level }),
        ...(input.topics !== undefined && { topics: input.topics as object }),
        ...(input.glossary !== undefined && { glossary: input.glossary as object }),
        ...(input.accessibilityMetadata !== undefined && {
          accessibilityMetadata: input.accessibilityMetadata as object,
        }),
        ...(input.tags !== undefined && { tags: input.tags as object }),
      },
    });
    return { id: updated.id, title: updated.title };
  }

  async setActive(id: string, isActive: boolean, userId: string, role: string): Promise<void> {
    const content = await this.prisma.content.findUnique({ where: { id } });
    if (!content) throw new AppError("Content not found", 404, "NOT_FOUND");
    await this.ensureCanManageContent(content.categoryId, userId, role);
    await this.prisma.content.update({
      where: { id },
      data: { isActive },
    });
  }

  private toContentDto(c: {
    id: string;
    title: string;
    contentText: string;
    categoryId: string;
    grade: string;
    level: string;
    userId: string;
    isActive: boolean;
    topics: unknown;
    glossary: unknown;
    accessibilityMetadata: unknown;
    tags: unknown;
    createdAt: Date;
    updatedAt: Date;
    category?: { id: string; name: string };
  }): unknown {
    return {
      id: c.id,
      title: c.title,
      contentText: c.contentText,
      categoryId: c.categoryId,
      category: c.category,
      grade: c.grade,
      level: c.level,
      userId: c.userId,
      isActive: c.isActive,
      topics: c.topics,
      glossary: c.glossary,
      accessibilityMetadata: c.accessibilityMetadata,
      tags: c.tags,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private toStudentContentDto(c: {
    id: string;
    title: string;
    contentText: string;
    categoryId: string;
    grade: string;
    level: string;
    isActive: boolean;
    topics: unknown;
    glossary: unknown;
    tags: unknown;
    category?: { id: string; name: string };
  }): unknown {
    return {
      id: c.id,
      title: c.title,
      contentText: c.contentText,
      categoryId: c.categoryId,
      category: c.category,
      grade: c.grade,
      level: c.level,
      topics: c.topics,
      glossary: c.glossary,
      tags: c.tags,
    };
  }
}
