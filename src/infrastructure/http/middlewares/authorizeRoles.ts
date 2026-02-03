import type { Request, Response, NextFunction } from "express";
import { AppError } from "@shared/errors/AppError.js";

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Forbidden", 403));
      return;
    }
    next();
  };
}
