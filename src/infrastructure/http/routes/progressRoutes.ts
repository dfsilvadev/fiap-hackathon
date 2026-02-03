import { Router } from "express";
import { z } from "zod";
import { PROGRESS_STATUSES } from "@application/progress/types.js";
import {
  upsertProgress,
  listProgressByCategory,
  getAssessmentAvailable,
} from "../controllers/progressController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const progressStatusSchema = z.enum(PROGRESS_STATUSES);

const upsertProgressBodySchema = z.object({
  contentId: z.string().uuid(),
  status: progressStatusSchema,
  timeSpent: z.number().int().min(0).optional(),
});

const listProgressQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid(),
  }),
});

const assessmentAvailableQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid(),
    level: z.enum(["1", "2", "3"]),
  }),
});

export function registerProgressRoutes(router: Router): void {
  router.patch(
    "/progress",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ body: upsertProgressBodySchema }),
    upsertProgress
  );

  router.get(
    "/progress/assessment-available",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ query: assessmentAvailableQuerySchema.shape.query }),
    getAssessmentAvailable
  );

  router.get(
    "/progress",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ query: listProgressQuerySchema.shape.query }),
    listProgressByCategory
  );
}
