import { Router } from "express";
import { z } from "zod";
import { GRADES } from "@shared/constants/grades.js";
import { CONTENT_LEVELS } from "@shared/constants/contentLevels.js";
import {
  createContent,
  getContentById,
  listContents,
  listContentsForStudent,
  updateContent,
  setContentActive,
} from "../controllers/contentController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const contentLevelSchema = z.enum(CONTENT_LEVELS);
const gradeSchema = z.enum(GRADES);

const createContentBodySchema = z.object({
  title: z.string().min(1),
  contentText: z.string().min(1),
  categoryId: z.string().uuid(),
  grade: gradeSchema,
  level: contentLevelSchema,
  topics: z.unknown().optional(),
  glossary: z.unknown().optional(),
  accessibilityMetadata: z.unknown().optional(),
  tags: z.array(z.string()).optional(),
});

const updateContentBodySchema = z.object({
  title: z.string().min(1).optional(),
  contentText: z.string().min(1).optional(),
  grade: gradeSchema.optional(),
  level: contentLevelSchema.optional(),
  topics: z.unknown().optional(),
  glossary: z.unknown().optional(),
  accessibilityMetadata: z.unknown().optional(),
  tags: z.array(z.string()).optional(),
});

const listContentsQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    grade: z.enum(GRADES).optional(),
    level: z.enum(CONTENT_LEVELS).optional(),
    isActive: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const listContentsForStudentQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const setActiveBodySchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),
});

export function registerContentRoutes(router: Router): void {
  router.post(
    "/contents",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ body: createContentBodySchema }),
    createContent
  );

  router.get(
    "/contents/for-student",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ query: listContentsForStudentQuerySchema.shape.query }),
    listContentsForStudent
  );

  router.get(
    "/contents",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ query: listContentsQuerySchema.shape.query }),
    listContents
  );

  router.get(
    "/contents/:id",
    authenticate,
    validateRequest({ params: idParamSchema.shape.params }),
    getContentById
  );

  router.patch(
    "/contents/:id",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: updateContentBodySchema,
    }),
    updateContent
  );

  router.patch(
    "/contents/:id/active",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: setActiveBodySchema.shape.body,
    }),
    setContentActive
  );
}
