import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { AdminAuthController } from "@/interface-adapters/controllers/auth/AdminAuthController";
import { API_ROUTES } from "@/config/routes.config";

export function getAdminAuthRoutes(container: Container): Router {
  const router = Router();

  const adminAuthController = container.get<AdminAuthController>(
    TYPES.AdminAuthController
  );

  router.post(
    API_ROUTES.AUTH.LOGIN,
    adminAuthController.login.bind(adminAuthController)
  );
  router.post(
    API_ROUTES.AUTH.FORGOT_PASSWORD,
    adminAuthController.forgotPassword.bind(adminAuthController)
  );
  router.post(
    API_ROUTES.AUTH.RESET_PASSWORD,
    adminAuthController.resetPassword.bind(adminAuthController)
  );

  return router;
}
