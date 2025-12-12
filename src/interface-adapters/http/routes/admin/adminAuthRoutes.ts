import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../../../config/types";
import { AdminAuthController } from "../../../controllers/auth/AdminAuthController";

export function getAdminAuthRoutes(container: Container): Router {
  const router = Router();

  const adminAuthController = container.get<AdminAuthController>(
    TYPES.AdminAuthController
  );

  router.post("/login", adminAuthController.login.bind(adminAuthController));
  router.post(
    "/forgot-password",
    adminAuthController.forgotPassword.bind(adminAuthController)
  );
  router.post(
    "/reset-password",
    adminAuthController.resetPassword.bind(adminAuthController)
  );

  return router;
}
