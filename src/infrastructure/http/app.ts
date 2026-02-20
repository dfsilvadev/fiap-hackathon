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

function isLoopbackIp(ip?: string): boolean {
  return ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1";
}

function normalizePath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

export function createApp(): express.Application {
  const app = express();
  const isProduction = env.NODE_ENV === "production";
  const enableHelmet = env.ENABLE_HELMET ?? isProduction;
  const enableRateLimit = env.ENABLE_RATE_LIMIT ?? isProduction;

  if (enableHelmet) {
    app.use(helmet());
  }
  app.use(express.json());

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:5173"],
    })
  );

  if (enableRateLimit) {
    const authLimiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: isProduction ? env.RATE_LIMIT_AUTH_MAX : Math.max(env.RATE_LIMIT_AUTH_MAX, 300),
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => isLoopbackIp(req.ip),
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
      skipFailedRequests: true,
      skip: (req) => {
        if (isLoopbackIp(req.ip)) return true;
        if (!isProduction) return true;
        const requestPath = normalizePath(req.path);
        if (requestPath === "/health") return true;
        return requestPath.startsWith("/auth");
      },
      message: {
        error: true,
        message: "Too many API requests. Please try again shortly.",
      },
    });

    app.use("/api/auth", authLimiter);
    app.use("/api", apiLimiter);
  }

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
