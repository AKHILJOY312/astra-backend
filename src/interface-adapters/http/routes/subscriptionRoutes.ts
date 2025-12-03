// src/interfaces/http/routes/subscriptionRoutes.ts
import { Router } from "express";
import {
  planController,
  subscriptionController,
} from "../../../config/container";
import { protect } from "../../../config/container";

const router = Router();

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
export default router;
