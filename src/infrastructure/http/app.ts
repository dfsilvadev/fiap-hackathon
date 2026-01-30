import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "@shared/config/env.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { registerHealthRoutes } from "./routes/healthRoutes.js";

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

  const apiRouter = express.Router();
  registerHealthRoutes(apiRouter);
  app.use("/api", apiRouter);

  app.use(errorHandler);

  return app;
}
