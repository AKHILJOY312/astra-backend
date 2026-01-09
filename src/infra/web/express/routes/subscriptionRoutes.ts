import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { SubscriptionController } from "@/interface-adapters/controllers/plan/SubscriptionController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";

export function getSubscriptionRoutes(container: Container): Router {
  const router = Router();

  const subscriptionController = container.get<SubscriptionController>(
    TYPES.SubscriptionController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect);

  router
    .route(API_ROUTES.SUBSCRIPTION.PLANS)
    .get(asyncHandler(subscriptionController.getPlansToSubscribe));

  router
    .route(API_ROUTES.SUBSCRIPTION.LIMITS)
    .get(asyncHandler(subscriptionController.getLimits));

  router
    .route(API_ROUTES.SUBSCRIPTION.RAZORPAY.ORDER)
    .post(asyncHandler(subscriptionController.upgrade));

  router
    .route(API_ROUTES.SUBSCRIPTION.RAZORPAY.CAPTURE)
    .post(asyncHandler(subscriptionController.capture));

  router
    .route(API_ROUTES.SUBSCRIPTION.PAYMENT_HISTORY)
    .get(asyncHandler(subscriptionController.paymentHistory));

  return router;
}
