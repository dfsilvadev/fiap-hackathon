import type { Request, Response, NextFunction } from "express";
import { prisma } from "@infrastructure/persistence/prisma.js";

export async function listCategories(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ categories });
  } catch (e) {
    next(e);
  }
}
