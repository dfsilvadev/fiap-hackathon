import { AssessmentService } from "@application/assessment/assessmentService.js";
import type {
  CreateAssessmentInput,
  CreateQuestionInput,
  ListAssessmentsFilters,
  SubmitAssessmentInput,
  UpdateAssessmentInput,
  UpdateQuestionInput,
} from "@application/assessment/types.js";
import { prisma } from "@infrastructure/persistence/prisma.js";
import type { NextFunction, Request, Response } from "express";

const assessmentService = new AssessmentService(prisma);

export async function createAssessment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const body = req.body as CreateAssessmentInput;
    const result = await assessmentService.createAssessment(body, req.user.sub, req.user.role);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getAssessmentById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const assessment = await assessmentService.getAssessmentById(id, req.user.sub, req.user.role);
    res.status(200).json(assessment);
  } catch (e) {
    next(e);
  }
}

export async function listAssessments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const query = req.query as Record<string, string | undefined>;
    const filters: ListAssessmentsFilters = {
      categoryId: query.categoryId,
      grade: query.grade,
      level: query.level,
      page: query.page != null ? Number(query.page) : undefined,
      limit: query.limit != null ? Number(query.limit) : undefined,
    };
    const { assessments, total } = await assessmentService.listAssessments(
      filters,
      req.user.sub,
      req.user.role
    );
    res.status(200).json({ assessments, total });
  } catch (e) {
    next(e);
  }
}

export async function listAvailableForStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const assessments = await assessmentService.listAvailableForStudent(req.user.sub);
    res.status(200).json({ assessments });
  } catch (e) {
    next(e);
  }
}

export async function getAssessmentForStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const assessmentId = req.params.id as string;
    const assessment = await assessmentService.getAssessmentForStudent(assessmentId, req.user.sub);
    res.status(200).json(assessment);
  } catch (e) {
    next(e);
  }
}

export async function updateAssessment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const body = req.body as UpdateAssessmentInput;
    const result = await assessmentService.updateAssessment(id, body, req.user.sub, req.user.role);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function createQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const assessmentId = req.params.id as string;
    const body = req.body as CreateQuestionInput;
    const result = await assessmentService.createQuestion(
      assessmentId,
      body,
      req.user.sub,
      req.user.role
    );
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function listQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const assessmentId = req.params.id as string;
    const questions = await assessmentService.listQuestions(
      assessmentId,
      req.user.sub,
      req.user.role
    );
    res.status(200).json({ questions });
  } catch (e) {
    next(e);
  }
}

export async function updateQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const questionId = req.params.questionId as string;
    const body = req.body as UpdateQuestionInput;
    const result = await assessmentService.updateQuestion(
      questionId,
      body,
      req.user.sub,
      req.user.role
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function deleteQuestion(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const questionId = req.params.questionId as string;
    await assessmentService.deleteQuestion(questionId, req.user.sub, req.user.role);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function submitAssessment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const assessmentId = req.params.id as string;
    const body = req.body as SubmitAssessmentInput;
    const result = await assessmentService.submitAssessment(assessmentId, req.user.sub, body);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getAssessmentResultForStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const assessmentId = req.params.id as string;
    const result = await assessmentService.getAssessmentResultForStudent(
      assessmentId,
      req.user.sub
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}
