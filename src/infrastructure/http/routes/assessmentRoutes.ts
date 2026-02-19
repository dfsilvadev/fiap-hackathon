import { ASSESSMENT_LEVELS, QUESTION_TYPES } from "@application/assessment/types.js";
import { GRADES } from "@shared/constants/grades.js";
import { Router } from "express";
import { z } from "zod";
import {
  createAssessment,
  createQuestion,
  deleteQuestion,
  getAssessmentById,
  getAssessmentForStudent,
  getAssessmentResultForStudent,
  listAssessments,
  listAvailableForStudent,
  listQuestions,
  submitAssessment,
  updateAssessment,
  updateQuestion,
} from "../controllers/assessmentController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const assessmentLevelSchema = z.enum(ASSESSMENT_LEVELS);
const questionTypeSchema = z.enum(QUESTION_TYPES);
const gradeSchema = z.enum(GRADES);

const createAssessmentBodySchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().uuid(),
  grade: gradeSchema,
  level: assessmentLevelSchema,
  minScore: z.number().min(0).max(100).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
});

const updateAssessmentBodySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

const listAssessmentsQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().uuid().optional(),
    grade: gradeSchema.optional(),
    level: assessmentLevelSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

const createQuestionBodySchema = z.object({
  questionText: z.string().min(1),
  questionType: questionTypeSchema,
  options: z.unknown().optional(),
  correctAnswer: z.string().min(1),
  points: z.number().min(0).optional(),
  tags: z.unknown().optional(),
  orderNumber: z.number().int().min(0),
});

const updateQuestionBodySchema = z.object({
  questionText: z.string().min(1).optional(),
  questionType: questionTypeSchema.optional(),
  options: z.unknown().optional(),
  correctAnswer: z.string().min(1).optional(),
  points: z.number().min(0).optional(),
  tags: z.unknown().optional(),
  orderNumber: z.number().int().min(0).optional(),
});

const submitAnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string(),
});

const submitAssessmentBodySchema = z.object({
  answers: z.array(submitAnswerSchema).min(1),
});

const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

const questionIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
    questionId: z.string().uuid(),
  }),
});

export function registerAssessmentRoutes(router: Router): void {
  router.post(
    "/assessments",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ body: createAssessmentBodySchema }),
    createAssessment
  );

  router.get(
    "/assessments/available",
    authenticate,
    authorizeRoles("student"),
    listAvailableForStudent
  );

  router.get(
    "/assessments",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ query: listAssessmentsQuerySchema.shape.query }),
    listAssessments
  );

  router.get(
    "/assessments/:id/for-student",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ params: idParamSchema.shape.params }),
    getAssessmentForStudent
  );

  router.post(
    "/assessments/:id/questions",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: createQuestionBodySchema,
    }),
    createQuestion
  );

  router.get(
    "/assessments/:id/questions",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ params: idParamSchema.shape.params }),
    listQuestions
  );

  router.patch(
    "/assessments/:id/questions/:questionId",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: questionIdParamSchema.shape.params,
      body: updateQuestionBodySchema,
    }),
    updateQuestion
  );

  router.delete(
    "/assessments/:id/questions/:questionId",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ params: questionIdParamSchema.shape.params }),
    deleteQuestion
  );

  router.post(
    "/assessments/:id/submit",
    authenticate,
    authorizeRoles("student"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: submitAssessmentBodySchema,
    }),
    submitAssessment
  );

  router.get(
    "/assessments/:id/result",
    authenticate,
    authorizeRoles("student"),
    validateRequest({ params: idParamSchema.shape.params }),
    getAssessmentResultForStudent
  );

  router.get(
    "/assessments/:id",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({ params: idParamSchema.shape.params }),
    getAssessmentById
  );

  router.patch(
    "/assessments/:id",
    authenticate,
    authorizeRoles("coordinator", "teacher"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: updateAssessmentBodySchema,
    }),
    updateAssessment
  );
}
