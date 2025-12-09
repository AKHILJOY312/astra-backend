// src/interfaces/http/routes/adminAuthRoutes.ts
import { Router } from "express";
import { adminUserController } from "../../../../config/container";
import { protect } from "../../../../config/container";
import { adminOnly } from "../../../../infra/middleware/adminOnly";

const router = Router();
router.use(protect, adminOnly);
router.get("/", adminUserController.listUsers.bind(adminUserController));
router.patch(
  "/:id/status",
  adminUserController.updateStatus.bind(adminUserController)
);
router.patch(
  "/:id/role",
  adminUserController.updateRole.bind(adminUserController)
);

export default router;
