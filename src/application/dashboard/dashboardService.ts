import { AppError } from "@shared/errors/AppError.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

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
        return {
          students: [],
          total: 0,
          subjects: [],
          summaryByGrade: [],
          subjectsByGrade: [],
          learningPaths: [],
        };
      }
    }

    const studentRole = await this.prisma.role.findFirst({
      where: { name: "student" },
      select: { id: true },
    });
    if (!studentRole) {
      return {
        students: [],
        total: 0,
        subjects: [],
        summaryByGrade: [],
        subjectsByGrade: [],
        learningPaths: [],
      };
    }

    const categories =
      categoryIds != null
        ? await this.prisma.category.findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true },
          })
        : await this.prisma.category.findMany({ select: { id: true, name: true } });

    // Overview: alunos ativos/total por série, conteúdos/avaliações por série, matérias por série, trilhas
    const allStudentsForGrade = await this.prisma.user.findMany({
      where: { roleId: studentRole.id },
      select: { id: true, currentGrade: true, isActive: true },
    });

    const byGradeMap = new Map<
      string,
      {
        totalStudents: number;
        activeStudents: number;
        contentsCount: number;
        assessmentsCount: number;
      }
    >();
    for (const s of allStudentsForGrade) {
      const grade = s.currentGrade ?? "sem-serie";
      const entry = byGradeMap.get(grade) ?? {
        totalStudents: 0,
        activeStudents: 0,
        contentsCount: 0,
        assessmentsCount: 0,
      };
      entry.totalStudents += 1;
      if (s.isActive) entry.activeStudents += 1;
      byGradeMap.set(grade, entry);
    }

    const contentWhere =
      role === "teacher"
        ? { userId, categoryId: categoryIds != null ? { in: categoryIds } : undefined }
        : { categoryId: categoryIds != null ? { in: categoryIds } : undefined };
    const contentsByGrade = await this.prisma.content.groupBy({
      by: ["grade"],
      where: contentWhere,
      _count: { _all: true },
    });
    for (const g of contentsByGrade) {
      const grade = g.grade;
      const entry = byGradeMap.get(grade) ?? {
        totalStudents: 0,
        activeStudents: 0,
        contentsCount: 0,
        assessmentsCount: 0,
      };
      entry.contentsCount = g._count._all;
      byGradeMap.set(grade, entry);
    }

    const assessmentsWithGrade = await this.prisma.assessment.findMany({
      where: role === "teacher" ? { teacherId: userId } : {},
      select: { id: true, grade: true },
    });
    const assessmentGradeCount = new Map<string, number>();
    for (const a of assessmentsWithGrade) {
      const grade = a.grade ?? "sem-serie";
      assessmentGradeCount.set(grade, (assessmentGradeCount.get(grade) ?? 0) + 1);
    }
    for (const [grade, count] of assessmentGradeCount) {
      const entry = byGradeMap.get(grade) ?? {
        totalStudents: 0,
        activeStudents: 0,
        contentsCount: 0,
        assessmentsCount: 0,
      };
      entry.assessmentsCount = count;
      byGradeMap.set(grade, entry);
    }

    const summaryByGrade = Array.from(byGradeMap.entries())
      .map(([grade, v]) => ({ grade, ...v }))
      .sort((a, b) => String(a.grade).localeCompare(String(b.grade)));

    // Matérias que leciona por série: por categoria, por grade (contentsCount, pathsCount, assessmentsCount)
    const pathCategoryGrade = await this.prisma.learningPath.findMany({
      where: { categoryId: categoryIds != null ? { in: categoryIds } : undefined, isActive: true },
      select: { categoryId: true, grade: true, id: true },
    });
    const contentCategoryGrade = await this.prisma.content.findMany({
      where: contentWhere,
      select: { categoryId: true, grade: true },
    });
    const assessmentCategoryGradeRows = await this.prisma.assessment.findMany({
      where: role === "teacher" ? { teacherId: userId } : {},
      select: { categoryId: true, grade: true },
    });

    const subjectGradeStats = new Map<
      string,
      Map<string, { contentsCount: number; pathsCount: number; assessmentsCount: number }>
    >();
    for (const c of categories) {
      subjectGradeStats.set(c.id, new Map());
    }
    for (const c of contentCategoryGrade) {
      if (!subjectGradeStats.has(c.categoryId)) continue;
      const byGrade = subjectGradeStats.get(c.categoryId)!;
      const cur = byGrade.get(c.grade) ?? { contentsCount: 0, pathsCount: 0, assessmentsCount: 0 };
      cur.contentsCount += 1;
      byGrade.set(c.grade, cur);
    }
    for (const p of pathCategoryGrade) {
      if (!subjectGradeStats.has(p.categoryId)) continue;
      const byGrade = subjectGradeStats.get(p.categoryId)!;
      const cur = byGrade.get(p.grade) ?? { contentsCount: 0, pathsCount: 0, assessmentsCount: 0 };
      cur.pathsCount += 1;
      byGrade.set(p.grade, cur);
    }
    for (const a of assessmentCategoryGradeRows) {
      if (!subjectGradeStats.has(a.categoryId)) continue;
      const grade = a.grade ?? "sem-serie";
      const byGrade = subjectGradeStats.get(a.categoryId)!;
      const cur = byGrade.get(grade) ?? { contentsCount: 0, pathsCount: 0, assessmentsCount: 0 };
      cur.assessmentsCount += 1;
      byGrade.set(grade, cur);
    }

    const subjectsByGrade = categories.map((cat) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      byGrade: Array.from((subjectGradeStats.get(cat.id) ?? new Map()).entries()).map(
        ([grade, stats]) => ({ grade, ...stats })
      ),
    }));

    // Trilhas: título, quantidade de módulos, alunos (da série da trilha), % conclusão
    const pathsWithContents = await this.prisma.learningPath.findMany({
      where: { categoryId: categoryIds != null ? { in: categoryIds } : undefined, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
        contents: { orderBy: { orderNumber: "asc" }, select: { contentId: true } },
      },
    });

    const learningPaths: Array<{
      pathId: string;
      title: string;
      grade: string;
      categoryId: string;
      categoryName: string;
      moduleCount: number;
      studentCount: number;
      completionPercentage: number;
    }> = [];

    for (const path of pathsWithContents) {
      const contentIds = path.contents.map((c) => c.contentId);
      const moduleCount = contentIds.length;
      const studentsInGrade = allStudentsForGrade.filter((s) => s.currentGrade === path.grade);
      const studentCount = studentsInGrade.length;

      let completionPercentage = 0;
      if (moduleCount > 0 && studentCount > 0) {
        const progressRows = await this.prisma.studentProgress.findMany({
          where: {
            studentId: { in: studentsInGrade.map((s) => s.id) },
            contentId: { in: contentIds },
            status: "completed",
          },
          select: { studentId: true, contentId: true },
        });
        const completedTotal = progressRows.length;
        completionPercentage = Math.round((completedTotal / (moduleCount * studentCount)) * 100);
      }

      learningPaths.push({
        pathId: path.id,
        title: path.name,
        grade: path.grade,
        categoryId: path.categoryId,
        categoryName: path.category.name,
        moduleCount,
        studentCount,
        completionPercentage,
      });
    }

    const where: { roleId: string; currentGrade?: string } = { roleId: studentRole.id };
    if (filters.currentGrade != null && filters.currentGrade !== "") {
      where.currentGrade = filters.currentGrade;
    }

    const students = await this.prisma.user.findMany({
      where: { ...where, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        currentGrade: true,
        guardians: true,
        dateOfBirth: true,
        phone: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    if (students.length === 0) {
      return {
        students: [],
        total: 0,
        subjects: categories,
        summaryByGrade,
        subjectsByGrade,
        learningPaths,
      };
    }

    const studentIds = students.map((s) => s.id);
    const levelWhere: { studentId: { in: string[] }; categoryId?: { in: string[] } } = {
      studentId: { in: studentIds },
    };
    if (categoryIds != null) levelWhere.categoryId = { in: categoryIds };

    const [levelRows, recommendations] = await Promise.all([
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
      guardians: s.guardians,
      dateOfBirth: s.dateOfBirth,
      phone: s.phone,
      isActive: s.isActive,
      levelsBySubject: levelsByStudent.get(s.id) ?? [],
      pendingRecommendations: recsByStudent.get(s.id) ?? [],
    }));

    return {
      students: studentsPayload,
      total: studentsPayload.length,
      subjects: categories,
      summaryByGrade,
      subjectsByGrade,
      learningPaths,
    };
  }

  /**
   * Coordinator-only dashboard. Aggregated view of the platform:
   * - summary metrics (students/teachers/contents/assessments/recommendations)
   * - breakdown by grade (students and pending recommendations)
   * - breakdown by subject (contents, paths, assessments, students with pending recommendations)
   */
  async getCoordinatorDashboard(): Promise<unknown> {
    // Roles
    const [studentRole, teacherRole] = await this.prisma.role.findMany({
      where: { name: { in: ["student", "teacher"] } },
      select: { id: true, name: true },
    });

    const studentRoleId = studentRole?.name === "student" ? studentRole.id : undefined;
    const teacherRoleId = teacherRole?.name === "teacher" ? teacherRole.id : undefined;

    // Basic queries in paralelo
    const [
      students,
      teachers,
      pendingRecommendations,
      contentsGroup,
      pathsGroup,
      assessmentsGroup,
      categories,
    ] = await Promise.all([
      this.prisma.user.findMany({
        where: studentRoleId ? { roleId: studentRoleId } : { role: { name: "student" } },
        select: { id: true, currentGrade: true, isActive: true },
      }),
      this.prisma.user.findMany({
        where: teacherRoleId ? { roleId: teacherRoleId } : { role: { name: "teacher" } },
        select: { id: true },
      }),
      this.prisma.recommendation.findMany({
        where: { status: "pending" },
        select: {
          studentId: true,
          content: { select: { categoryId: true } },
        },
      }),
      this.prisma.content.groupBy({
        by: ["categoryId"],
        _count: { _all: true },
      }),
      this.prisma.learningPath.groupBy({
        by: ["categoryId"],
        _count: { _all: true },
      }),
      this.prisma.assessment.groupBy({
        by: ["categoryId"],
        _count: { _all: true },
      }),
      this.prisma.category.findMany({
        select: { id: true, name: true },
      }),
    ]);

    // Summary
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.isActive).length;
    const inactiveStudents = totalStudents - activeStudents;
    const totalTeachers = teachers.length;
    const totalPendingRecommendations = pendingRecommendations.length;

    const totalContents = contentsGroup.reduce((sum, g) => sum + g._count._all, 0);
    const totalLearningPaths = pathsGroup.reduce((sum, g) => sum + g._count._all, 0);
    const totalAssessments = assessmentsGroup.reduce((sum, g) => sum + g._count._all, 0);

    // By grade
    const studentsByGrade = new Map<
      string,
      { grade: string; studentCount: number; pendingRecommendationsCount: number }
    >();
    const studentGradeById = new Map<string, string | null>(
      students.map((s) => [s.id, s.currentGrade ?? null])
    );

    for (const s of students) {
      const grade = s.currentGrade ?? "UNKNOWN";
      const entry = studentsByGrade.get(grade) ?? {
        grade,
        studentCount: 0,
        pendingRecommendationsCount: 0,
      };
      entry.studentCount += 1;
      studentsByGrade.set(grade, entry);
    }

    for (const rec of pendingRecommendations) {
      const grade = studentGradeById.get(rec.studentId) ?? "UNKNOWN";
      const entry = studentsByGrade.get(grade);
      if (entry) {
        entry.pendingRecommendationsCount += 1;
      } else {
        studentsByGrade.set(grade, {
          grade,
          studentCount: 0,
          pendingRecommendationsCount: 1,
        });
      }
    }

    const byGrade = Array.from(studentsByGrade.values()).sort((a, b) =>
      String(a.grade).localeCompare(String(b.grade))
    );

    // By subject
    const contentCountByCategory = new Map<string, number>(
      contentsGroup.map((g) => [g.categoryId, g._count._all])
    );
    const pathsCountByCategory = new Map<string, number>(
      pathsGroup.map((g) => [g.categoryId, g._count._all])
    );
    const assessmentsCountByCategory = new Map<string, number>(
      assessmentsGroup.map((g) => [g.categoryId, g._count._all])
    );

    const studentsWithRecsByCategory = new Map<string, Set<string>>();
    for (const rec of pendingRecommendations) {
      const catId = rec.content.categoryId;
      const set = studentsWithRecsByCategory.get(catId) ?? new Set<string>();
      set.add(rec.studentId);
      studentsWithRecsByCategory.set(catId, set);
    }

    const bySubject = categories.map((c) => {
      const contentsCount = contentCountByCategory.get(c.id) ?? 0;
      const pathsCount = pathsCountByCategory.get(c.id) ?? 0;
      const assessmentsCount = assessmentsCountByCategory.get(c.id) ?? 0;
      const studentsWithPendingRecommendations = studentsWithRecsByCategory.get(c.id)?.size ?? 0;

      return {
        categoryId: c.id,
        categoryName: c.name,
        contentsCount,
        pathsCount,
        assessmentsCount,
        studentsWithPendingRecommendations,
      };
    });

    return {
      summary: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        totalTeachers,
        pendingRecommendations: totalPendingRecommendations,
        totalContents,
        totalLearningPaths,
        totalAssessments,
      },
      byGrade,
      bySubject,
    };
  }
}
