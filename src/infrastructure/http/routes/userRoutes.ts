import { Router } from "express";
import { z } from "zod";
import { GRADES } from "@shared/constants/grades.js";
import {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  setUserActive,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { requireSelfOrCoordinator } from "../middlewares/requireSelfOrCoordinator.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const guardianSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  relationship: z.string().min(1),
});

const createUserBodySchema = z.discriminatedUnion("role", [
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.literal("student"),
    currentGrade: z.enum(GRADES),
    guardians: z.array(guardianSchema).min(1),
    dateOfBirth: z.string().optional(),
  }),
  z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.literal("teacher"),
    categoryIds: z.array(z.string().uuid()).min(1),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
]);

const updateUserBodySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  currentGrade: z.enum(GRADES).optional(),
  guardians: z.array(guardianSchema).min(1).optional(),
  phone: z.string().nullable().optional(),
  categoryIds: z.array(z.string().uuid()).min(1).optional(),
  dateOfBirth: z.string().nullable().optional(),
});

const listUsersQuerySchema = z.object({
  query: z.object({
    role: z.enum(["student", "teacher"]).optional(),
    currentGrade: z.enum(GRADES).optional(),
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

export function registerUserRoutes(router: Router): void {
  router.post(
    "/users",
    authenticate,
    authorizeRoles("coordinator"),
    validateRequest({ body: createUserBodySchema }),
    createUser
  );

  router.get(
    "/users",
    authenticate,
    authorizeRoles("coordinator"),
    validateRequest({ query: listUsersQuerySchema.shape.query }),
    listUsers
  );

  router.get(
    "/users/:id",
    authenticate,
    validateRequest({ params: idParamSchema.shape.params }),
    requireSelfOrCoordinator,
    getUserById
  );

  router.patch(
    "/users/:id",
    authenticate,
    validateRequest({
      params: idParamSchema.shape.params,
      body: updateUserBodySchema,
    }),
    requireSelfOrCoordinator,
    updateUser
  );

  router.patch(
    "/users/:id/active",
    authenticate,
    authorizeRoles("coordinator"),
    validateRequest({
      params: idParamSchema.shape.params,
      body: setActiveBodySchema.shape.body,
    }),
    setUserActive
  );
}
