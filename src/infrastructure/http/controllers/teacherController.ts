import type { NextFunction, Request, Response } from "express";
import { SubjectService } from "@application/subject/subjectService.js";
import { prisma } from "@infrastructure/persistence/prisma.js";

const subjectService = new SubjectService(prisma);

/**
 * GET /api/teachers/subjects
 * Returns the subjects (matérias) the authenticated teacher teaches,
 * with contents and learning paths count per subject. Paginated.
 */
export async function getTeacherSubjects(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const query = req.query as { page?: number; limit?: number };
    const result = await subjectService.getSubjectsByTeacher(req.user.sub, {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    });
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}
