import { Router } from "express";
import { z } from "zod";
import { RECOMMENDATION_STATUSES } from "@application/recommendation/types.js";
import {
  listRecommendations,
  updateRecommendationStatus,
} from "../controllers/recommendationController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const recommendationStatusSchema = z.enum(RECOMMENDATION_STATUSES);

const listRecommendationsQuerySchema = z.object({
  query: z.object({
    status: recommendationStatusSchema.optional(),
  }),
});

const updateRecommendationStatusBodySchema = z.object({
  status: z.enum(["completed", "dismissed"]),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export function registerRecommendationRoutes(router: Router): void {
  router.get(
    "/recommendations",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ query: listRecommendationsQuerySchema.shape.query }),
    listRecommendations
  );

  router.patch(
    "/recommendations/:id",
    authenticate,
    authorizeRoles("student"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: updateRecommendationStatusBodySchema,
    }),
    updateRecommendationStatus
  );
}
