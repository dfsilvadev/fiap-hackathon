import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "@shared/errors/AppError.js";

/**
 * Validates body/query/params with Zod. Usage: validateRequest({ body: mySchema })
 */
export function validateRequest(schemas: { body?: ZodType; query?: ZodType; params?: ZodType }) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as Request["body"];
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request["query"];
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request["params"];
      }
      next();
    } catch (error) {
      if (error && typeof error === "object" && "issues" in error) {
        const msg = (error as { issues: unknown[] }).issues
          .map((i: unknown) => (i as { message?: string }).message ?? "")
          .join("; ");
        next(new AppError(msg, 400, "VALIDATION_ERROR"));
        return;
      }
      next(error);
    }
  };
}
