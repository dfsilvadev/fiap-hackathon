import { GRADES } from "@shared/constants/grades.js";
import { Router } from "express";
import { z } from "zod";
import {
  getCoordinatorDashboard,
  getProfessorStudentsDashboard,
  getStudentDashboard,
} from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const professorStudentsQuerySchema = z.object({
  query: z.object({
    currentGrade: z.enum(GRADES).optional(),
  }),
});

export function registerDashboardRoutes(router: Router): void {
  router.get("/dashboard/student", authenticate, authorizeRoles("student"), getStudentDashboard);

  router.get(
    "/dashboard/professor/students",
    authenticate,
    authorizeRoles("teacher", "coordinator"),
    validateRequest({ query: professorStudentsQuerySchema.shape.query }),
    getProfessorStudentsDashboard
  );

  router.get(
    "/dashboard/coordinator",
    authenticate,
    authorizeRoles("coordinator"),
    getCoordinatorDashboard
  );
}
