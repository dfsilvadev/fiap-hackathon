import type { Request, Response, NextFunction } from "express";
import { prisma } from "@infrastructure/persistence/prisma.js";
import { LearningPathService } from "@application/learningPath/learningPathService.js";
import type {
  CreateLearningPathInput,
  UpdateLearningPathInput,
  ListLearningPathsFilters,
  AddContentToPathInput,
  ReorderPathContentsInput,
} from "@application/learningPath/types.js";

const learningPathService = new LearningPathService(prisma);

export async function createLearningPath(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const body = req.body as CreateLearningPathInput;
    const result = await learningPathService.create(body, req.user.sub, req.user.role);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getLearningPathById(
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
    const path = await learningPathService.getById(id, req.user.sub, req.user.role);
    res.status(200).json(path);
  } catch (e) {
    next(e);
  }
}

export async function listLearningPaths(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const query = req.query as ListLearningPathsFilters;
    const filters: ListLearningPathsFilters = {
      categoryId: query.categoryId,
      grade: query.grade,
      page: query.page,
      limit: query.limit,
    };
    const { paths, total } = await learningPathService.list(filters, req.user.sub, req.user.role);
    res.status(200).json({ paths, total });
  } catch (e) {
    next(e);
  }
}

export async function getLearningPathForStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const categoryId = req.query.categoryId as string;
    if (!categoryId) {
      res.status(400).json({ error: true, message: "categoryId is required" });
      return;
    }
    const path = await learningPathService.getForStudent(categoryId, req.user.sub);
    res.status(200).json(path);
  } catch (e) {
    next(e);
  }
}

export async function updateLearningPath(
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
    const body = req.body as UpdateLearningPathInput;
    const result = await learningPathService.update(id, body, req.user.sub, req.user.role);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function addContentToPath(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const pathId = req.params.id as string;
    const body = req.body as AddContentToPathInput;
    await learningPathService.addContent(pathId, body, req.user.sub, req.user.role);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function removeContentFromPath(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const pathId = req.params.id as string;
    const contentId = req.params.contentId as string;
    await learningPathService.removeContent(pathId, contentId, req.user.sub, req.user.role);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function reorderPathContents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const pathId = req.params.id as string;
    const body = req.body as ReorderPathContentsInput;
    await learningPathService.reorderContents(pathId, body, req.user.sub, req.user.role);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
