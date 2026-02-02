import { Router } from "express";
import { z } from "zod";
import { GRADES } from "@shared/constants/grades.js";
import {
  createLearningPath,
  getLearningPathById,
  listLearningPaths,
  getLearningPathForStudent,
  updateLearningPath,
  addContentToPath,
  removeContentFromPath,
  reorderPathContents,
} from "../controllers/learningPathController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const gradeSchema = z.enum(GRADES);

const createLearningPathBodySchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid(),
  grade: gradeSchema,
  isDefault: z.boolean().optional(),
  description: z.string().optional(),
});

const updateLearningPathBodySchema = z.object({
  name: z.string().min(1).optional(),
  isDefault: z.boolean().optional(),
  description: z.string().optional(),
});

const listLearningPathsQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    grade: gradeSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const forStudentQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid(),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const addContentBodySchema = z.object({
  contentId: z.string().uuid(),
  orderNumber: z.number().int().min(0),
});

const reorderBodySchema = z.object({
  items: z
    .array(
      z.object({
        contentId: z.string().uuid(),
        orderNumber: z.number().int().min(0),
      })
    )
    .min(1),
});

const pathIdContentIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    contentId: z.string().uuid(),
  }),
});

export function registerLearningPathRoutes(router: Router): void {
  router.post(
    "/learning-paths",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ body: createLearningPathBodySchema }),
    createLearningPath
  );

  router.get(
    "/learning-paths/for-student",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ query: forStudentQuerySchema.shape.query }),
    getLearningPathForStudent
  );

  router.get(
    "/learning-paths",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ query: listLearningPathsQuerySchema.shape.query }),
    listLearningPaths
  );

  router.get(
    "/learning-paths/:id",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ params: idParamSchema.shape.params }),
    getLearningPathById
  );

  router.patch(
    "/learning-paths/:id",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: updateLearningPathBodySchema,
    }),
    updateLearningPath
  );

  router.post(
    "/learning-paths/:id/contents",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: addContentBodySchema,
    }),
    addContentToPath
  );

  router.delete(
    "/learning-paths/:id/contents/:contentId",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ params: pathIdContentIdParamsSchema.shape.params }),
    removeContentFromPath
  );

  router.patch(
    "/learning-paths/:id/contents/reorder",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: reorderBodySchema,
    }),
    reorderPathContents
  );
}
