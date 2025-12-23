import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { AdminUserController } from "@/interface-adapters/controllers/user/AdminUserController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { adminOnly } from "@/infra/web/express/middleware/adminOnly";
import { API_ROUTES } from "@/config/routes.config";

export function getAdminUserRoutes(container: Container): Router {
  const router = Router();

  const adminUserController = container.get<AdminUserController>(
    TYPES.AdminUserController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect, adminOnly);

  router.get(
    API_ROUTES.ADMIN.ROOT,
    adminUserController.listUsers.bind(adminUserController)
  );

  router.patch(
    API_ROUTES.ADMIN.STATUS,
    adminUserController.blockUser.bind(adminUserController)
  );

  router.patch(
    API_ROUTES.ADMIN.ROLE,
    adminUserController.updateRole.bind(adminUserController)
  );

  return router;
}
