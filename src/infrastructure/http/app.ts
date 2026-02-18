import { env } from "@shared/config/env.js";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { errorHandler } from "./middlewares/errorHandler.js";
import { registerAssessmentRoutes } from "./routes/assessmentRoutes.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerCategoryRoutes } from "./routes/categoryRoutes.js";
import { registerContentRoutes } from "./routes/contentRoutes.js";
import { registerDashboardRoutes } from "./routes/dashboardRoutes.js";
import { registerHealthRoutes } from "./routes/healthRoutes.js";
import { registerLearningPathRoutes } from "./routes/learningPathRoutes.js";
import { registerProgressRoutes } from "./routes/progressRoutes.js";
import { registerRecommendationRoutes } from "./routes/recommendationRoutes.js";
import { registerTeacherRoutes } from "./routes/teacherRoutes.js";
import { registerUserRoutes } from "./routes/userRoutes.js";

export function createApp(): express.Application {
  const app = express();
  const isProduction = env.NODE_ENV === "production";

  app.use(helmet());
  app.use(express.json());

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:5173"],
    })
  );

  const authLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: isProduction ? env.RATE_LIMIT_AUTH_MAX : Math.max(env.RATE_LIMIT_AUTH_MAX, 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: true,
      message: "Too many authentication requests. Please try again shortly.",
    },
  });

  const apiLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: isProduction ? env.RATE_LIMIT_MAX : Math.max(env.RATE_LIMIT_MAX, env.RATE_LIMIT_DEV_MAX),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (req.path === "/api/health" || req.path === "/api/health/") return true;
      return req.path.startsWith("/api/auth");
    },
    message: {
      error: true,
      message: "Too many API requests. Please try again shortly.",
    },
  });

  app.use("/api/auth", authLimiter);
  app.use("/api", apiLimiter);

  const apiRouter = express.Router({ strict: false });
  registerHealthRoutes(apiRouter);
  registerAuthRoutes(apiRouter);
  registerUserRoutes(apiRouter);
  registerContentRoutes(apiRouter);
  registerLearningPathRoutes(apiRouter);
  registerProgressRoutes(apiRouter);
  registerAssessmentRoutes(apiRouter);
  registerRecommendationRoutes(apiRouter);
  registerDashboardRoutes(apiRouter);
  registerTeacherRoutes(apiRouter);
  registerCategoryRoutes(apiRouter);
  app.use("/api", apiRouter);

  app.use("/api/*", (_req, res) => {
    res.status(404).json({
      error: true,
      message: "Route not found",
      path: _req.originalUrl,
      method: _req.method,
    });
  });

  app.use(errorHandler);

  return app;
}
