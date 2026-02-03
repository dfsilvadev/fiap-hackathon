import type { PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "@shared/errors/AppError.js";

/**
 * Student dashboard. Aggregates paths per subject (with content status),
 * progress per subject, and pending recommendations in few queries to avoid N+1.
 */
export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStudentDashboard(studentId: string): Promise<unknown> {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { currentGrade: true },
    });
    if (!student?.currentGrade) {
      throw new AppError("Student has no grade set", 400, "VALIDATION_ERROR");
    }

    const grade = student.currentGrade;

    const paths = await this.prisma.learningPath.findMany({
      where: { grade, isDefault: true, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        contents: {
          orderBy: { orderNumber: "asc" },
          include: {
            content: { select: { id: true, title: true, level: true } },
          },
        },
      },
    });

    if (paths.length === 0) {
      return {
        grade,
        pathsBySubject: [],
        pendingRecommendations: [],
      };
    }

    const categoryIds = paths.map((p) => p.categoryId);
    const allContentIds = paths.flatMap((p) => p.contents.map((c) => c.contentId));

    const [levelRows, progressRows, recommendations] = await Promise.all([
      this.prisma.studentLearningLevel.findMany({
        where: { studentId, categoryId: { in: categoryIds } },
      }),
      this.prisma.studentProgress.findMany({
        where: { studentId, contentId: { in: allContentIds } },
      }),
      this.prisma.recommendation.findMany({
        where: { studentId, status: "pending" },
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
      }),
    ]);

    const levelByCategory = new Map(levelRows.map((l) => [l.categoryId, l.level]));
    const progressByContent = new Map(
      progressRows.map((p) => [p.contentId, { status: p.status, completedAt: p.completedAt }])
    );

    const pathsBySubject = paths.map((path) => {
      const currentLevel = levelByCategory.get(path.categoryId) ?? "1";
      const studentLevelNum = parseInt(currentLevel, 10) || 1;
      let completedCount = 0;
      const contents = path.contents.map((pc) => {
        const prog = progressByContent.get(pc.contentId);
        const progressStatus = prog?.status ?? "not_started";
        if (progressStatus === "completed") completedCount++;
        const levelNum = parseInt(pc.content.level, 10) || 1;
        let status: "blocked" | "available" | "completed" =
          progressStatus === "completed"
            ? "completed"
            : levelNum > studentLevelNum
              ? "blocked"
              : "available";

        return {
          contentId: pc.content.id,
          title: pc.content.title,
          level: pc.content.level,
          status,
          progressStatus,
          completedAt: prog?.completedAt ?? null,
        };
      });
      const totalContents = path.contents.length;
      const percentage = totalContents > 0 ? Math.round((completedCount / totalContents) * 100) : 0;

      return {
        categoryId: path.categoryId,
        category: path.category,
        pathId: path.id,
        pathName: path.name,
        grade: path.grade,
        currentLevel,
        totalContents,
        completedCount,
        percentage,
        contents,
      };
    });

    const pendingRecommendations = recommendations.map((r) => ({
      id: r.id,
      contentId: r.contentId,
      reason: r.reason,
      content: r.content,
    }));

    return {
      grade,
      pathsBySubject,
      pendingRecommendations,
    };
  }

  /**
   * Professor/coordinator dashboard. Lists students with level per subject
   * and pending recommendations. Teacher: only subjects they teach; coordinator: all.
   */
  async getProfessorStudentsDashboard(
    userId: string,
    role: string,
    filters: { currentGrade?: string } = {}
  ): Promise<unknown> {
    if (role !== "teacher" && role !== "coordinator") {
      throw new AppError("Forbidden", 403, "FORBIDDEN");
    }

    let categoryIds: string[] | null = null;
    if (role === "teacher") {
      const subjects = await this.prisma.teacherSubject.findMany({
        where: { teacherId: userId },
        select: { categoryId: true },
      });
      categoryIds = subjects.map((s) => s.categoryId);
      if (categoryIds.length === 0) {
        return { students: [], total: 0, subjects: [] };
      }
    }

    const studentRole = await this.prisma.role.findFirst({
      where: { name: "student" },
      select: { id: true },
    });
    if (!studentRole) return { students: [], total: 0, subjects: [] };

    const where: { roleId: string; currentGrade?: string } = { roleId: studentRole.id };
    if (filters.currentGrade != null && filters.currentGrade !== "") {
      where.currentGrade = filters.currentGrade;
    }

    const students = await this.prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, currentGrade: true },
      orderBy: { name: "asc" },
    });
    if (students.length === 0) {
      const subjects =
        categoryIds != null
          ? await this.prisma.category.findMany({
              where: { id: { in: categoryIds } },
              select: { id: true, name: true },
            })
          : await this.prisma.category.findMany({ select: { id: true, name: true } });
      return { students: [], total: 0, subjects };
    }

    const studentIds = students.map((s) => s.id);
    const levelWhere: { studentId: { in: string[] }; categoryId?: { in: string[] } } = {
      studentId: { in: studentIds },
    };
    if (categoryIds != null) levelWhere.categoryId = { in: categoryIds };

    const [levelRows, recommendations, categories] = await Promise.all([
      this.prisma.studentLearningLevel.findMany({
        where: levelWhere,
        include: { category: { select: { id: true, name: true } } },
      }),
      this.prisma.recommendation.findMany({
        where: {
          studentId: { in: studentIds },
          status: "pending",
        },
        include: {
          content: {
            select: {
              id: true,
              title: true,
              categoryId: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      }),
      categoryIds != null
        ? this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : this.prisma.category.findMany({ select: { id: true, name: true } }),
    ]);

    const levelsByStudent = new Map<
      string,
      Array<{ categoryId: string; categoryName: string; level: string }>
    >();
    for (const row of levelRows) {
      const list = levelsByStudent.get(row.studentId) ?? [];
      list.push({
        categoryId: row.categoryId,
        categoryName: row.category.name,
        level: row.level,
      });
      levelsByStudent.set(row.studentId, list);
    }

    const recsByStudent = new Map<
      string,
      Array<{
        id: string;
        contentId: string;
        contentTitle: string;
        reason: string;
        categoryName: string;
      }>
    >();
    for (const r of recommendations) {
      if (categoryIds != null && !categoryIds.includes(r.content.categoryId)) continue;
      const list = recsByStudent.get(r.studentId) ?? [];
      list.push({
        id: r.id,
        contentId: r.contentId,
        contentTitle: r.content.title,
        reason: r.reason,
        categoryName: r.content.category.name,
      });
      recsByStudent.set(r.studentId, list);
    }

    const studentsPayload = students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      currentGrade: s.currentGrade,
      levelsBySubject: levelsByStudent.get(s.id) ?? [],
      pendingRecommendations: recsByStudent.get(s.id) ?? [],
    }));

    return {
      students: studentsPayload,
      total: studentsPayload.length,
      subjects: categories,
    };
  }
}
