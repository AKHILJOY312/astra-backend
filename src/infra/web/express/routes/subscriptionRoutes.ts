import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { SubscriptionController } from "@/interface-adapters/controllers/plan/SubscriptionController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";

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
    "/plans",
    subscriptionController.getPlansToSubscribe.bind(subscriptionController)
  );
  router.get(
    "/limits",
    subscriptionController.getLimits.bind(subscriptionController)
  );
  router.post(
    "/razorpay/order",
    subscriptionController.upgrade.bind(subscriptionController)
  );
  router.post(
    "/razorpay/capture",
    subscriptionController.capture.bind(subscriptionController)
  );

  return router;
}
