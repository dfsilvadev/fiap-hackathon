import { Router } from "express";
import { z } from "zod";
import { login, refresh, logout } from "../controllers/authController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { validateRequest } from "../middlewares/validateRequest.js";

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export function registerAuthRoutes(router: Router): void {
  router.post("/auth/login", validateRequest({ body: loginBodySchema }), login);
  router.post("/auth/refresh", validateRequest({ body: refreshBodySchema }), refresh);
  router.post("/auth/logout", logout);
  router.get("/auth/me", authenticate, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  router.get("/auth/me/coordinator", authenticate, authorizeRoles("coordinator"), (req, res) => {
    res.status(200).json({ user: req.user });
  });
}
