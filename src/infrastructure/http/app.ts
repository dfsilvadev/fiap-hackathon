import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "@shared/config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { registerAuthRoutes } from "./routes/authRoutes.js";
import { registerHealthRoutes } from "./routes/healthRoutes.js";
import { registerUserRoutes } from "./routes/userRoutes.js";
import { registerContentRoutes } from "./routes/contentRoutes.js";
import { registerLearningPathRoutes } from "./routes/learningPathRoutes.js";

export function createApp(): express.Application {
  const app = express();

  app.use(helmet());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  const apiRouter = express.Router({ strict: false });
  registerHealthRoutes(apiRouter);
  registerAuthRoutes(apiRouter);
  registerUserRoutes(apiRouter);
  registerContentRoutes(apiRouter);
  registerLearningPathRoutes(apiRouter);
  app.use("/api", apiRouter);

  app.use("/api/*", (_req, res) => {
    res.status(404).json({
      error: true,
      message: "Rota não encontrada",
      path: _req.originalUrl,
      method: _req.method,
    });
  });

  app.use(errorHandler);

  return app;
}
