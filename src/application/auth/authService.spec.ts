import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../shared/errors/AppError.js";
import { AuthService } from "./authService.js";

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

import bcrypt from "bcrypt";

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(mockPrisma as never);
  });

  describe("login", () => {
    it("deve retornar accessToken e refreshToken com credenciais válidas", async () => {
      const userId = "user-1";
      const roleId = "role-1";
      const passwordHash = "$2b$10$hashed";
      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: "user@example.com",
        passwordHash,
        isActive: true,
        role: { id: roleId, name: "coordinator" },
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockPrisma.refreshToken.create.mockResolvedValue({ id: "rt-1" });

      const result = await authService.login({
        email: "user@example.com",
        password: "Senha123",
      });

      expect(result).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(String),
        tokenType: "Bearer",
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com", isActive: true },
        include: { role: true },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith("Senha123", passwordHash);
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
    });

    it("deve normalizar email para lowercase no login", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(authService.login({ email: "USER@Example.COM", password: "x" })).rejects.toThrow(
        AppError
      );
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com", isActive: true },
        include: { role: true },
      });
    });

    it("deve lançar 401 quando usuário não existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const err = await authService
        .login({ email: "inexistente@example.com", password: "x" })
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toBe("Invalid credentials");
    });

    it("deve lançar 401 quando senha está incorreta", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "u1",
        passwordHash: "$2b$10$hash",
        isActive: true,
        role: { name: "student" },
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const err = await authService
        .login({ email: "user@example.com", password: "wrong" })
        .catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
    });

    it("não encontra usuário inativo pois a query filtra por isActive: true", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: "inactive@example.com", password: "ok" })
      ).rejects.toThrow(AppError);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "inactive@example.com", isActive: true },
        include: { role: true },
      });
    });
  });

  describe("refresh", () => {
    it("deve retornar novos tokens com refresh token válido", async () => {
      const record = {
        id: "rt-1",
        userId: "user-1",
        tokenHash: "hashed",
        expiresAt: new Date(Date.now() + 86400000),
        revokedAt: null,
        user: {
          id: "user-1",
          isActive: true,
          role: { name: "teacher" },
        },
      };
      mockPrisma.refreshToken.findFirst.mockResolvedValue(record);
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({ id: "rt-2" });

      const result = await authService.refresh({ refreshToken: "valid-refresh-token" });

      expect(result).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        tokenType: "Bearer",
      });
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: record.id },
        data: { revokedAt: expect.any(Date) },
      });
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
    });

    it("deve lançar 401 quando refresh token não existe ou está revogado", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      const err = await authService.refresh({ refreshToken: "invalid-token" }).catch((e) => e);
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(401);
      expect((err as AppError).message).toContain("Invalid or expired");
    });

    it("deve lançar 401 quando refresh token expirado", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: "rt-1",
        userId: "u1",
        expiresAt: new Date(Date.now() - 1000),
        revokedAt: null,
        user: { isActive: true, role: { name: "student" } },
      });

      await expect(authService.refresh({ refreshToken: "expired-token" })).rejects.toThrow(
        AppError
      );
    });
  });

  describe("logout", () => {
    it("deve revogar o refresh token quando existir", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: "rt-1",
        revokedAt: null,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      await authService.logout("some-refresh-token");

      expect(mockPrisma.refreshToken.findFirst).toHaveBeenCalled();
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "rt-1" },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it("não deve lançar erro quando token não existe (idempotente)", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      await expect(authService.logout("inexistente")).resolves.toBeUndefined();
      expect(mockPrisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});
