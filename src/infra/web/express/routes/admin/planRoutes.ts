import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { PlanController } from "@/interface-adapters/controllers/plan/PlanController";
import { createProtectMiddleware } from "@/infra/middleware/protect";
import { adminOnly } from "@/infra/middleware/adminOnly";

export function getAdminPlanRoutes(container: Container): Router {
  const router = Router();

  const planController = container.get<PlanController>(TYPES.PlanController);
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect, adminOnly);

  router
    .route("/")
    .post(planController.create.bind(planController))
    .get(planController.getAll.bind(planController));

  router
    .route("/:id")
    .put(planController.update.bind(planController))
    .delete(planController.delete.bind(planController));

  return router;
}
