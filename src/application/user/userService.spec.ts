import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../shared/errors/AppError.js";
import { UserService } from "./userService.js";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  role: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
  },
  teacherSubject: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
  studentLearningLevel: {
    createMany: vi.fn(),
  },
};

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    userService = new UserService(mockPrisma as never);
  });

  describe("create", () => {
    const roleStudent = { id: "role-student", name: "student" };
    const roleTeacher = { id: "role-teacher", name: "teacher" };
    const categories = [{ id: "cat-1" }, { id: "cat-2" }];

    it("deve criar aluno com série, guardians e níveis iniciais", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue(roleStudent);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-1",
        email: "aluno@example.com",
      });
      mockPrisma.category.findMany.mockResolvedValue(categories);
      mockPrisma.studentLearningLevel.createMany.mockResolvedValue({ count: 2 });

      const result = await userService.create({
        name: "Aluno",
        email: "aluno@example.com",
        password: "Senha123",
        role: "student",
        currentGrade: "7",
        guardians: [
          {
            name: "Pai",
            phone: "11999999999",
            email: "pai@example.com",
            relationship: "pai",
          },
        ],
      });

      expect(result).toEqual({ id: "user-1", email: "aluno@example.com" });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "aluno@example.com" },
      });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Aluno",
          email: "aluno@example.com",
          roleId: roleStudent.id,
          currentGrade: "7",
          guardians: expect.any(Object),
        }),
      });
      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(mockPrisma.studentLearningLevel.createMany).toHaveBeenCalledWith({
        data: [
          { studentId: "user-1", categoryId: "cat-1", level: "1" },
          { studentId: "user-1", categoryId: "cat-2", level: "1" },
        ],
      });
    });

    it("deve criar professor com categoryIds e teacherSubject", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue(roleTeacher);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-2",
        email: "prof@example.com",
      });
      mockPrisma.teacherSubject.createMany.mockResolvedValue({ count: 2 });

      const result = await userService.create({
        name: "Professor",
        email: "prof@example.com",
        password: "Senha123",
        role: "teacher",
        categoryIds: ["cat-1", "cat-2"],
      });

      expect(result).toEqual({ id: "user-2", email: "prof@example.com" });
      expect(mockPrisma.teacherSubject.createMany).toHaveBeenCalledWith({
        data: [
          { teacherId: "user-2", categoryId: "cat-1" },
          { teacherId: "user-2", categoryId: "cat-2" },
        ],
      });
    });

    it("deve lançar EMAIL_IN_USE quando email já existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "existing" });

      const err = await userService
        .create({
          name: "Outro",
          email: "existente@example.com",
          password: "Senha123",
          role: "student",
          currentGrade: "8",
          guardians: [
            {
              name: "Mae",
              phone: "11888888888",
              email: "mae@example.com",
              relationship: "mae",
            },
          ],
        })
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).code).toBe("EMAIL_IN_USE");
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("deve lançar VALIDATION_ERROR para aluno sem guardians", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue(roleStudent);

      const err = await userService
        .create({
          name: "Aluno",
          email: "a@example.com",
          password: "Senha123",
          role: "student",
          currentGrade: "9",
          guardians: [],
        })
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).code).toBe("VALIDATION_ERROR");
    });

    it("deve lançar VALIDATION_ERROR para professor sem categoryIds", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue(roleTeacher);

      const err = await userService
        .create({
          name: "Prof",
          email: "p@example.com",
          password: "Senha123",
          role: "teacher",
          categoryIds: [],
        })
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(400);
      expect((err as AppError).code).toBe("VALIDATION_ERROR");
    });

    it("deve lançar ROLE_NOT_FOUND quando role não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue(null);

      const err = await userService
        .create({
          name: "Aluno",
          email: "a@example.com",
          password: "Senha123",
          role: "student",
          currentGrade: "6",
          guardians: [
            {
              name: "R",
              phone: "1",
              email: "r@example.com",
              relationship: "pai",
            },
          ],
        })
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).code).toBe("ROLE_NOT_FOUND");
    });
  });

  describe("list", () => {
    it("deve retornar lista paginada e total", async () => {
      const users = [
        {
          id: "u1",
          name: "A",
          email: "a@example.com",
          roleId: "r1",
        },
      ];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.role.findMany.mockResolvedValue([{ id: "r1", name: "student" }]);
      mockPrisma.teacherSubject.findMany.mockResolvedValue([]);

      const result = await userService.list({ page: 1, limit: 10 });

      expect(result.total).toBe(1);
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toMatchObject({
        id: "u1",
        name: "A",
        email: "a@example.com",
        role: "student",
      });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { name: "asc" },
        })
      );
    });

    it("deve aplicar filtros role e currentGrade", async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.role.findMany.mockResolvedValue([]);
      mockPrisma.teacherSubject.findMany.mockResolvedValue([]);

      await userService.list({
        role: "teacher",
        currentGrade: "8",
        page: 2,
        limit: 5,
      });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: { name: "teacher" }, currentGrade: "8" },
          skip: 5,
          take: 5,
        })
      );
    });
  });

  describe("getById", () => {
    it("deve retornar usuário enriquecido com role", async () => {
      const user = {
        id: "u1",
        name: "User",
        email: "u@example.com",
        roleId: "r1",
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.role.findMany.mockResolvedValue([{ id: "r1", name: "coordinator" }]);
      mockPrisma.teacherSubject.findMany.mockResolvedValue([]);

      const result = await userService.getById("u1");

      expect(result).toMatchObject({
        id: "u1",
        name: "User",
        email: "u@example.com",
        role: "coordinator",
      });
    });

    it("deve lançar NOT_FOUND quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const err = await userService.getById("inexistente").catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
      expect((err as AppError).code).toBe("NOT_FOUND");
    });
  });

  describe("update", () => {
    it("deve atualizar nome e email quando coordenador", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        roleId: "r-teacher",
      });
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.role.findFirst.mockResolvedValue({ name: "teacher" });
      mockPrisma.user.update.mockResolvedValue({
        id: "u1",
        email: "novo@example.com",
      });

      const result = await userService.update(
        "u1",
        { name: "Novo Nome", email: "novo@example.com" },
        "coordinator",
        "coord-id"
      );

      expect(result).toEqual({ id: "u1", email: "novo@example.com" });
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: expect.objectContaining({
          name: "Novo Nome",
          email: "novo@example.com",
        }),
      });
    });

    it("deve lançar Forbidden quando não é próprio nem coordenador", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", roleId: "r1" });

      const err = await userService
        .update("u1", { name: "X" }, "teacher", "outro-user-id")
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(403);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it("deve lançar NOT_FOUND quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const err = await userService
        .update("inexistente", { name: "X" }, "coordinator", "c1")
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
    });
  });

  describe("setActive", () => {
    it("deve atualizar is_active", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
      mockPrisma.user.update.mockResolvedValue({});

      await userService.setActive("u1", false);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { isActive: false },
      });
    });

    it("deve lançar NOT_FOUND quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const err = await userService.setActive("inexistente", true).catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(404);
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});
