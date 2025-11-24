// src/interfaces/http/routes/subscriptionRoutes.ts
import { Router } from "express";
import { subscriptionController } from "../../../config/container";
import { protect } from "../../../config/container";

const router = Router();

router.use(protect);

router.get(
  "/limits",
  subscriptionController.getLimits.bind(subscriptionController)
);
router.post(
  "/upgrade",
  subscriptionController.upgrade.bind(subscriptionController)
);

export default router;
