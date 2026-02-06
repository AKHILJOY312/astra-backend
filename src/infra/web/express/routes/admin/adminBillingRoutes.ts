import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { adminOnly } from "@/infra/web/express/middleware/adminOnly";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../../handler/asyncHandler";
import { AdminBillingController } from "@/interface-adapters/controllers/billing/AdminBillingController";

export function getAdminbillingsRoutes(container: Container): Router {
  const router = Router();

  const adminBillingController = container.get<AdminBillingController>(
    TYPES.AdminBillingController,
  );

  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware,
  );

  router.use(protect, adminOnly);

  router
    .route(API_ROUTES.ADMIN.BILLING)
    .get(asyncHandler(adminBillingController.getPaymentOverview))
    .post(asyncHandler(adminBillingController.userPaymentDetails));

  // router
  //   .route(API_ROUTES.ADMIN.DETAILS)
  //   .get(asyncHandler(adminBillingController.userPaymentDetails));

  router
    .route(API_ROUTES.ADMIN.DASHBOARD)
    .get(asyncHandler(adminBillingController.dashboardStats));
  return router;
}
