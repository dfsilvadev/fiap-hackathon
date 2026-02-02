import type { Request, Response, NextFunction } from "express";
import { prisma } from "@infrastructure/persistence/prisma.js";
import { ProgressService } from "@application/progress/progressService.js";
import type { UpsertProgressInput } from "@application/progress/types.js";

const progressService = new ProgressService(prisma);

export async function upsertProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const body = req.body as UpsertProgressInput;
    const progress = await progressService.upsert(req.user.sub, body);
    res.status(200).json(progress);
  } catch (e) {
    next(e);
  }
}

export async function listProgressByCategory(
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
    const result = await progressService.listByCategory(req.user.sub, categoryId);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getAssessmentAvailable(
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
    const level = req.query.level as string;
    if (!categoryId || !level) {
      res.status(400).json({
        error: true,
        message: "categoryId and level are required",
      });
      return;
    }
    const available = await progressService.isAssessmentAvailable(req.user.sub, categoryId, level);
    res.status(200).json({ available });
  } catch (e) {
    next(e);
  }
}
