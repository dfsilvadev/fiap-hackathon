import { Router } from "express";
import { z } from "zod";
import { getTeacherSubjects } from "../controllers/teacherController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const teacherSubjectsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  }),
});

export function registerTeacherRoutes(router: Router): void {
  router.get(
    "/teachers/subjects",
    authenticate,
    authorizeRoles("teacher"),
    validateRequest({ query: teacherSubjectsQuerySchema.shape.query }),
    getTeacherSubjects
  );
}
