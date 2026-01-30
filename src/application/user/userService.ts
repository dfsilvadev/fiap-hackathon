import type { PrismaClient } from "@generated/prisma/client";
import bcrypt from "bcrypt";
import { AppError } from "@shared/errors/AppError.js";
import { isGrade } from "@shared/constants/grades.js";
import type { CreateUserInput, UpdateUserInput, ListUsersFilters, Guardian } from "./types.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateUserInput): Promise<{ id: string; email: string }> {
    const email = input.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("Email already in use", 400, "EMAIL_IN_USE");
    }

    if (input.role === "student") {
      if (!isGrade(input.currentGrade)) {
        throw new AppError("Invalid currentGrade", 400, "VALIDATION_ERROR");
      }
      if (
        !Array.isArray(input.guardians) ||
        input.guardians.length < 1 ||
        !input.guardians.every(
          (g) =>
            g &&
            typeof g.name === "string" &&
            typeof g.phone === "string" &&
            typeof g.email === "string" &&
            typeof g.relationship === "string"
        )
      ) {
        throw new AppError(
          "Student must have at least one guardian (name, phone, email, relationship)",
          400,
          "VALIDATION_ERROR"
        );
      }
    }

    if (input.role === "teacher") {
      if (!Array.isArray(input.categoryIds) || input.categoryIds.length < 1) {
        throw new AppError(
          "Teacher must have at least one subject (categoryId)",
          400,
          "VALIDATION_ERROR"
        );
      }
    }

    const role = await this.prisma.role.findFirst({
      where: { name: input.role },
    });
    if (!role) {
      throw new AppError("Role not found", 400, "ROLE_NOT_FOUND");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const dateOfBirth = input.dateOfBirth != null ? new Date(input.dateOfBirth) : undefined;

    if (input.role === "student") {
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email,
          passwordHash,
          roleId: role.id,
          currentGrade: input.currentGrade,
          guardians: input.guardians as unknown as object,
          dateOfBirth,
        },
      });
      await this.createInitialLearningLevels(user.id);
      return { id: user.id, email: user.email };
    }

    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
        roleId: role.id,
        phone: input.phone ?? null,
        dateOfBirth,
      },
    });
    await this.prisma.teacherSubject.createMany({
      data: input.categoryIds.map((categoryId) => ({
        teacherId: user.id,
        categoryId,
      })),
    });
    return { id: user.id, email: user.email };
  }

  private async createInitialLearningLevels(studentId: string): Promise<void> {
    const categories = await this.prisma.category.findMany({
      select: { id: true },
    });
    await this.prisma.studentLearningLevel.createMany({
      data: categories.map((c) => ({
        studentId,
        categoryId: c.id,
        level: "1",
      })),
    });
  }

  async list(filters: ListUsersFilters): Promise<{ users: unknown[]; total: number }> {
    const page = Math.max(1, filters.page ?? DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, filters.limit ?? DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    const where: { role?: { name: string }; currentGrade?: string } = {};
    if (filters.role) {
      where.role = { name: filters.role };
    }
    if (filters.currentGrade != null && filters.currentGrade !== "") {
      where.currentGrade = filters.currentGrade;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: this.userSelect(),
        orderBy: { name: "asc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    const usersWithRoleAndSubjects = await this.enrichUsers(users);
    return { users: usersWithRoleAndSubjects, total };
  }

  async getById(id: string): Promise<unknown> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    });
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }
    const [enriched] = await this.enrichUsers([user]);
    return enriched;
  }

  async update(
    id: string,
    input: UpdateUserInput,
    requesterRole: string,
    requesterId: string
  ): Promise<{ id: string; email: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }

    const isCoordinator = requesterRole === "coordinator";
    const isSelf = requesterId === id;

    if (!isCoordinator && !isSelf) {
      throw new AppError("Forbidden", 403);
    }

    if (input.currentGrade !== undefined && !isGrade(input.currentGrade)) {
      throw new AppError("Invalid currentGrade", 400, "VALIDATION_ERROR");
    }

    if (input.guardians !== undefined) {
      if (
        !Array.isArray(input.guardians) ||
        input.guardians.length < 1 ||
        !input.guardians.every(
          (g: Guardian) =>
            g &&
            typeof g.name === "string" &&
            typeof g.phone === "string" &&
            typeof g.email === "string" &&
            typeof g.relationship === "string"
        )
      ) {
        throw new AppError("Student must have at least one guardian", 400, "VALIDATION_ERROR");
      }
    }

    if (input.categoryIds !== undefined) {
      if (!Array.isArray(input.categoryIds) || input.categoryIds.length < 1) {
        throw new AppError("Teacher must have at least one subject", 400, "VALIDATION_ERROR");
      }
      const role = await this.prisma.role.findFirst({
        where: { id: user.roleId },
      });
      if (role?.name === "teacher") {
        if (!isCoordinator && !isSelf) {
          throw new AppError("Forbidden", 403);
        }
        await this.prisma.teacherSubject.deleteMany({
          where: { teacherId: id },
        });
        await this.prisma.teacherSubject.createMany({
          data: input.categoryIds.map((categoryId) => ({
            teacherId: id,
            categoryId,
          })),
        });
      }
    }

    const email = input.email !== undefined ? input.email.toLowerCase().trim() : undefined;
    if (email) {
      const existing = await this.prisma.user.findFirst({
        where: { email, id: { not: id } },
      });
      if (existing) {
        throw new AppError("Email already in use", 400, "EMAIL_IN_USE");
      }
    }

    const dateOfBirth =
      input.dateOfBirth !== undefined
        ? input.dateOfBirth === null
          ? null
          : new Date(input.dateOfBirth as string)
        : undefined;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(email !== undefined && { email }),
        ...(input.currentGrade !== undefined && {
          currentGrade: input.currentGrade,
        }),
        ...(input.guardians !== undefined && {
          guardians: input.guardians as unknown as object,
        }),
        ...(input.phone !== undefined && { phone: input.phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
      },
    });

    return { id: updated.id, email: updated.email };
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("User not found", 404, "NOT_FOUND");
    }
    await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  private userSelect() {
    return {
      id: true,
      name: true,
      email: true,
      phone: true,
      roleId: true,
      dateOfBirth: true,
      currentGrade: true,
      guardians: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  private async enrichUsers(users: Array<{ roleId: string; id: string }>): Promise<unknown[]> {
    const roleIds = [...new Set(users.map((u) => u.roleId))];
    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
    });
    const roleMap = new Map(roles.map((r) => [r.id, r.name]));

    const teacherIds = users.filter((u) => roleMap.get(u.roleId) === "teacher").map((u) => u.id);
    const teacherSubjects =
      teacherIds.length > 0
        ? await this.prisma.teacherSubject.findMany({
            where: { teacherId: { in: teacherIds } },
            include: { category: { select: { id: true, name: true } } },
          })
        : [];

    return users.map((u) => {
      const roleName = roleMap.get(u.roleId);
      const subjects =
        roleName === "teacher"
          ? teacherSubjects
              .filter((ts) => ts.teacherId === u.id)
              .map((ts) => ({ id: ts.category.id, name: ts.category.name }))
          : undefined;
      return {
        ...u,
        role: roleName,
        ...(subjects != null && { teacherSubjects: subjects }),
      };
    });
  }
}
