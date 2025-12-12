import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../../../config/types";
import { AdminUserController } from "../../../controllers/user/AdminUserController";
import { createProtectMiddleware } from "../../../../infra/middleware/protect";
import { adminOnly } from "../../../../infra/middleware/adminOnly";

export function getAdminUserRoutes(container: Container): Router {
  const router = Router();

  const adminUserController = container.get<AdminUserController>(
    TYPES.AdminUserController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect, adminOnly);

  router.get("/", adminUserController.listUsers.bind(adminUserController));

  router.patch(
    "/:id/status",
    adminUserController.blockUser.bind(adminUserController)
  );

  router.patch(
    "/:id/role",
    adminUserController.updateRole.bind(adminUserController)
  );

  return router;
}
