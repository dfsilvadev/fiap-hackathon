import type { Request, Response, NextFunction } from "express";
import { AppError } from "@shared/errors/AppError.js";
import { env } from "@shared/config/env.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code,
    });
    return;
  }

  const statusCode = 500;
  const message = env.NODE_ENV === "production" ? "Internal server error" : err.message;

  res.status(statusCode).json({
    error: true,
    message,
  });
}
