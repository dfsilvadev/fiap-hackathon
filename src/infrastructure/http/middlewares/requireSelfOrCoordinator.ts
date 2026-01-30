import type { Request, Response, NextFunction } from "express";
import { AppError } from "@shared/errors/AppError.js";

/**
 * Requer que o usuário autenticado seja o próprio recurso (params.id) ou coordenador.
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
