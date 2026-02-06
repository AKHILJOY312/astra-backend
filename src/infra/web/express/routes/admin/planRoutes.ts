import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { PlanController } from "@/interface-adapters/controllers/billing/PlanController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { adminOnly } from "@/infra/web/express/middleware/adminOnly";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../../handler/asyncHandler";

export function getAdminPlanRoutes(container: Container): Router {
  const router = Router();

  const planController = container.get<PlanController>(TYPES.PlanController);
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware,
  );

  router.use(protect, adminOnly);

  router
    .route(API_ROUTES.ADMIN.ROOT)
    .post(asyncHandler(planController.create.bind(planController)))
    .get(asyncHandler(planController.getAll.bind(planController)));

  router
    .route(API_ROUTES.ADMIN.BY_ID)
    .put(asyncHandler(planController.update.bind(planController)))
    .delete(asyncHandler(planController.delete.bind(planController)));

  return router;
}
