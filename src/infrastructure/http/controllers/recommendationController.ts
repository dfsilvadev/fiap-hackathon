import { RecommendationService } from "@application/recommendation/recommendationService.js";
import type {
  ListRecommendationsFilters,
  UpdateRecommendationStatusInput,
} from "@application/recommendation/types.js";
import { prisma } from "@infrastructure/persistence/prisma.js";
import type { NextFunction, Request, Response } from "express";

const recommendationService = new RecommendationService(prisma);

export async function listRecommendations(
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
    const filters: ListRecommendationsFilters = {};
    if (query.status != null) filters.status = query.status as ListRecommendationsFilters["status"];
    const result = await recommendationService.listByStudent(req.user.sub, filters);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function updateRecommendationStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const recommendationId = req.params.id as string;
    const body = req.body as UpdateRecommendationStatusInput;
    const result = await recommendationService.updateStatus(recommendationId, req.user.sub, body);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}
