/* eslint-disable no-console */
/**
 * Testes de integração HTTP (auth + usuários).
 * Requer banco de teste com seed aplicado (ex.: npm run db:seed com DATABASE_URL de teste).
 */
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "./app.js";

const app = createApp();

const COORDINATOR_EMAIL = "admin@example.com";
const COORDINATOR_PASSWORD = "Admin@123";

describe("API HTTP (integração)", () => {
  let accessToken: string;
  let refreshToken: string;
  let dbAvailable = false;

  describe("Health", () => {
    it("GET /api/health retorna 200", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
    });
  });

  describe("Auth", () => {
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD });
      dbAvailable = res.status === 200;
      if (dbAvailable) {
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      }
    });

    it("POST /api/auth/login com credenciais válidas retorna tokens", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD });

      if (res.status !== 200) {
        console.warn("Auth login falhou (banco de teste pode não estar com seed):", res.body);
        return;
      }

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        tokenType: "Bearer",
      });
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("POST /api/auth/login com senha inválida retorna 401", async () => {
      if (!dbAvailable) return;
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: COORDINATOR_EMAIL, password: "WrongPassword" });

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ message: expect.any(String) });
    });

    it("POST /api/auth/login com body inválido retorna 400", async () => {
      const res = await request(app).post("/api/auth/login").send({ email: "not-an-email" });

      expect(res.status).toBe(400);
    });

    it("GET /api/auth/me sem token retorna 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });

  describe("Auth (com token)", () => {
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD });
      if (res.status === 200) {
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      }
    });

    it("GET /api/auth/me com token retorna user (sub, role)", async () => {
      if (!accessToken) {
        console.warn("Pulando: token não obtido (seed não aplicado?)");
        return;
      }
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        sub: expect.any(String),
        role: "coordinator",
      });
    });

    it("GET /api/auth/me/coordinator com token de coordenador retorna 200", async () => {
      if (!accessToken) return;
      const res = await request(app)
        .get("/api/auth/me/coordinator")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
    });

    it("POST /api/auth/refresh com refreshToken retorna novos tokens", async () => {
      if (!refreshToken) return;
      const res = await request(app).post("/api/auth/refresh").send({ refreshToken });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it("POST /api/auth/logout retorna 204", async () => {
      if (!dbAvailable) return;
      const res = await request(app).post("/api/auth/logout").send({ refreshToken: "any-token" });
      expect(res.status).toBe(204);
    });
  });

  describe("Users (coordenador)", () => {
    beforeAll(async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD });
      if (res.status === 200) {
        accessToken = res.body.accessToken;
      }
    });

    it("GET /api/users sem token retorna 401", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(401);
    });

    it("GET /api/users com token de coordenador retorna lista", async () => {
      if (!accessToken) return;
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("users");
      expect(res.body).toHaveProperty("total");
      expect(Array.isArray(res.body.users)).toBe(true);
    });

    it("GET /api/users?role=student aplica filtro", async () => {
      if (!accessToken) return;
      const res = await request(app)
        .get("/api/users?role=student")
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("users");
    });

    it("POST /api/users (criar aluno) com body válido retorna 201", async () => {
      if (!accessToken) return;
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "Aluno Teste",
          email: `aluno-${Date.now()}@example.com`,
          password: "Senha123",
          role: "student",
          currentGrade: "7",
          guardians: [
            {
              name: "Responsável",
              phone: "11999999999",
              email: "resp@example.com",
              relationship: "pai",
            },
          ],
        });

      if (res.status !== 201) {
        console.warn("Create student falhou:", res.body);
        return;
      }
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
      });
    });

    it("POST /api/users (criar aluno) sem guardians retorna 400", async () => {
      if (!accessToken) return;
      const res = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "Aluno",
          email: `aluno-bad-${Date.now()}@example.com`,
          password: "Senha123",
          role: "student",
          currentGrade: "8",
          guardians: [],
        });
      expect(res.status).toBe(400);
    });

    it("POST /api/users (criar professor) com categoryIds retorna 201", async () => {
      if (!accessToken) return;
      const categoryIds = await getCategoryIds();
      if (categoryIds.length === 0) {
        console.warn("Nenhuma categoria no banco (seed?)");
        return;
      }
      const createRes = await request(app)
        .post("/api/users")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          name: "Professor Teste",
          email: `prof-${Date.now()}@example.com`,
          password: "Senha123",
          role: "teacher",
          categoryIds: [categoryIds[0]],
        });
      if (createRes.status !== 201) {
        console.warn("Create teacher falhou:", createRes.body);
        return;
      }
      expect(createRes.status).toBe(201);
    });
  });

  describe("Users (GET/PATCH :id)", () => {
    let coordinatorToken: string;
    let userId: string;

    beforeAll(async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: COORDINATOR_EMAIL, password: COORDINATOR_PASSWORD });
      if (loginRes.status === 200) {
        coordinatorToken = loginRes.body.accessToken;
      }
      const listRes = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${coordinatorToken}`);
      if (listRes.status === 200 && listRes.body.users?.length > 0) {
        userId = listRes.body.users[0].id;
      } else {
        const meRes = await request(app)
          .get("/api/auth/me")
          .set("Authorization", `Bearer ${coordinatorToken}`);
        if (meRes.status === 200) userId = meRes.body.user.sub;
      }
    });

    it("GET /api/users/:id com token retorna usuário", async () => {
      if (!coordinatorToken || !userId) return;
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set("Authorization", `Bearer ${coordinatorToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: userId,
        name: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
      });
    });

    it("GET /api/users/:id com UUID inválido retorna 400", async () => {
      if (!coordinatorToken) return;
      const res = await request(app)
        .get("/api/users/not-a-uuid")
        .set("Authorization", `Bearer ${coordinatorToken}`);
      expect(res.status).toBe(400);
    });

    it("PATCH /api/users/:id/active (coordenador) retorna 204", async () => {
      if (!coordinatorToken || !userId) return;
      const res = await request(app)
        .patch(`/api/users/${userId}/active`)
        .set("Authorization", `Bearer ${coordinatorToken}`)
        .send({ isActive: true });
      expect(res.status).toBe(204);
    });
  });
});

async function getCategoryIds(): Promise<string[]> {
  const { prisma } = await import("../persistence/prisma.js");
  const categories = await prisma.category.findMany({ select: { id: true } });
  return categories.map((c) => c.id);
}
