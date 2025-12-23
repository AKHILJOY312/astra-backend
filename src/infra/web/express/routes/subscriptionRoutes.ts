import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { SubscriptionController } from "@/interface-adapters/controllers/plan/SubscriptionController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";

export function getSubscriptionRoutes(container: Container): Router {
  const router = Router();

  const subscriptionController = container.get<SubscriptionController>(
    TYPES.SubscriptionController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect);

  router.get(
    API_ROUTES.SUBSCRIPTION.PLANS,
    subscriptionController.getPlansToSubscribe.bind(subscriptionController)
  );
  router.get(
    API_ROUTES.SUBSCRIPTION.LIMITS,
    subscriptionController.getLimits.bind(subscriptionController)
  );
  router.post(
    API_ROUTES.SUBSCRIPTION.RAZORPAY.ORDER,
    subscriptionController.upgrade.bind(subscriptionController)
  );
  router.post(
    API_ROUTES.SUBSCRIPTION.RAZORPAY.CAPTURE,
    subscriptionController.capture.bind(subscriptionController)
  );

  return router;
}
