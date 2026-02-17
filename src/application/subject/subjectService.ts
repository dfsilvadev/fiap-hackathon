import type { PrismaClient } from "../../generated/prisma/client.js";

/**
 * Service for subject (category) operations. Used by teachers to list
 * the subjects they teach with related counts.
 */
export class SubjectService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Returns the subjects (matérias) that a teacher teaches, with counts of
   * contents and learning paths per subject. Paginated.
   */
  async getSubjectsByTeacher(
    teacherId: string,
    options: { page?: number; limit?: number }
  ): Promise<{
    subjects: Array<{
      id: string;
      name: string;
      contentsCount: number;
      pathsCount: number;
    }>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 10));
    const skip = (page - 1) * limit;

    const [total, allTeacherSubjects] = await Promise.all([
      this.prisma.teacherSubject.count({ where: { teacherId } }),
      this.prisma.teacherSubject.findMany({
        where: { teacherId },
        include: {
          category: { select: { id: true, name: true } },
        },
      }),
    ]);

    const teacherSubjects = allTeacherSubjects
      .sort((a, b) => a.category.name.localeCompare(b.category.name))
      .slice(skip, skip + limit);

    if (teacherSubjects.length === 0) {
      return {
        subjects: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    const categoryIds = teacherSubjects.map((ts) => ts.categoryId);

    const [contentsGroup, pathsGroup] = await Promise.all([
      this.prisma.content.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: categoryIds } },
        _count: { _all: true },
      }),
      this.prisma.learningPath.groupBy({
        by: ["categoryId"],
        where: { categoryId: { in: categoryIds } },
        _count: { _all: true },
      }),
    ]);

    const contentsByCategory = new Map(contentsGroup.map((g) => [g.categoryId, g._count._all]));
    const pathsByCategory = new Map(pathsGroup.map((g) => [g.categoryId, g._count._all]));

    const subjects = teacherSubjects.map((ts) => ({
      id: ts.category.id,
      name: ts.category.name,
      contentsCount: contentsByCategory.get(ts.categoryId) ?? 0,
      pathsCount: pathsByCategory.get(ts.categoryId) ?? 0,
    }));

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      subjects,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
