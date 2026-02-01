import type { Request, Response, NextFunction } from "express";
import { prisma } from "@infrastructure/persistence/prisma.js";
import { ContentService } from "@application/content/contentService.js";
import type {
  CreateContentInput,
  UpdateContentInput,
  ListContentsFilters,
  ListContentsForStudentFilters,
} from "@application/content/types.js";

const contentService = new ContentService(prisma);

export async function createContent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const body = req.body as CreateContentInput;
    const result = await contentService.create(body, req.user.sub, req.user.role);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getContentById(
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
    const content = await contentService.getById(id, req.user.sub, req.user.role);
    res.status(200).json(content);
  } catch (e) {
    next(e);
  }
}

export async function listContents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const query = req.query as ListContentsFilters & {
      isActive?: boolean;
      page?: number;
      limit?: number;
    };
    const { categoryId, grade, level, isActive, page, limit } = query;
    const filters: ListContentsFilters = {
      categoryId,
      grade,
      level,
      isActive,
      page,
      limit,
    };
    const { contents, total } = await contentService.list(filters, req.user.sub, req.user.role);
    res.status(200).json({ contents, total });
  } catch (e) {
    next(e);
  }
}

export async function listContentsForStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const query = req.query as ListContentsForStudentFilters;
    const filters: ListContentsForStudentFilters = {
      categoryId: query.categoryId,
      page: query.page,
      limit: query.limit,
    };
    const { contents, total } = await contentService.listForStudent(filters, req.user.sub);
    res.status(200).json({ contents, total });
  } catch (e) {
    next(e);
  }
}

export async function updateContent(
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
    const body = req.body as UpdateContentInput;
    const result = await contentService.update(id, body, req.user.sub, req.user.role);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function setContentActive(
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
    const { isActive } = req.body as { isActive: boolean };
    await contentService.setActive(id, Boolean(isActive), req.user.sub, req.user.role);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
