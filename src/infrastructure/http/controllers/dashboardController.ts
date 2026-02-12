import { DashboardService } from "@application/dashboard/dashboardService.js";
import { prisma } from "@infrastructure/persistence/prisma.js";
import type { NextFunction, Request, Response } from "express";

const dashboardService = new DashboardService(prisma);

export async function getStudentDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const dashboard = await dashboardService.getStudentDashboard(req.user.sub);
    res.status(200).json(dashboard);
  } catch (e) {
    next(e);
  }
}

export async function getProfessorStudentsDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    const query = req.query as Record<string, string | undefined>;
    const filters = { currentGrade: query.currentGrade };
    const result = await dashboardService.getProfessorStudentsDashboard(
      req.user.sub,
      req.user.role,
      filters
    );
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getCoordinatorDashboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: true, message: "Unauthorized" });
      return;
    }
    if (req.user.role !== "coordinator") {
      res.status(403).json({ error: true, message: "Forbidden" });
      return;
    }
    const result = await dashboardService.getCoordinatorDashboard();
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}
