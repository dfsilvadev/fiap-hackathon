import type { Request, Response, NextFunction } from "express";
import { AppError } from "@shared/errors/AppError.js";

/**
 * Requires the authenticated user to be the resource owner (params.id) or a coordinator.
 */
export function requireSelfOrCoordinator(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("Unauthorized", 401));
    return;
  }
  const resourceId = req.params.id;
  if (!resourceId) {
    next(new AppError("Missing resource id", 400));
    return;
  }
  if (req.user.role === "coordinator" || req.user.sub === resourceId) {
    next();
    return;
  }
  next(new AppError("Forbidden", 403));
}
