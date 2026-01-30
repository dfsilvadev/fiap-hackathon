import type { Request, Response, NextFunction } from "express";
import { prisma } from "@infrastructure/persistence/prisma.js";
import { UserService } from "@application/user/userService.js";
import type { CreateUserInput, UpdateUserInput } from "@application/user/types.js";

const userService = new UserService(prisma);

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body as CreateUserInput;
    const result = await userService.create(body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const role = req.query.role as string | undefined;
    const currentGrade = req.query.currentGrade as string | undefined;
    const page = req.query.page != null ? Number(req.query.page) : undefined;
    const limit = req.query.limit != null ? Number(req.query.limit) : undefined;
    const { users, total } = await userService.list({
      role: role as "student" | "teacher" | undefined,
      currentGrade,
      page,
      limit,
    });
    res.status(200).json({ users, total });
  } catch (e) {
    next(e);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const user = await userService.getById(id);
    res.status(200).json(user);
  } catch (e) {
    next(e);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const body = req.body as UpdateUserInput;
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const result = await userService.update(id, body, req.user.role, req.user.sub);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function setUserActive(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body as { isActive: boolean };
    await userService.setActive(id, Boolean(isActive));
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
