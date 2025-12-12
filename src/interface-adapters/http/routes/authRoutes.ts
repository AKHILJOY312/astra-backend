import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../../config/types";
import { AuthController } from "../../controllers/auth/AuthController";
import { createProtectMiddleware } from "../../../infra/middleware/protect";
import passport from "passport";

export function getAuthRoutes(container: Container): Router {
  const router = Router();

  const authController = container.get<AuthController>(TYPES.AuthController);

  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.post("/register", authController.register);
  router.get("/verify-email", authController.verifyEmail);
  router.post("/login", authController.login);
  router.post("/refresh-token", authController.refreshToken);
  router.post("/logout", authController.logout);
  router.get("/me", protect, authController.me);
  router.post("/forgot-password", authController.forgotPassword);
  router.get("/verify-reset-token", authController.verifyResetToken);
  router.post("/reset-password", authController.resetPassword);

  router.get("/google", authController.googleLogin);

  router.get(
    "/google/passport",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    authController.googleCallback
  );

  return router;
}
