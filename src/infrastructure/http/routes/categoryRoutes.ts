import { Router } from "express";
import { listCategories } from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/authenticate.js";

export function registerCategoryRoutes(router: Router): void {
  router.get("/categories", authenticate, listCategories);
}
