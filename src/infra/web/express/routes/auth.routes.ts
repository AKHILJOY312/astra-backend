import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { AuthController } from "@/interface-adapters/controllers/auth/AuthController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import passport from "passport";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";

export function getAuthRoutes(container: Container): Router {
  const router = Router();

  const authController = container.get<AuthController>(TYPES.AuthController);

  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware,
  );

  router
    .route(API_ROUTES.AUTH.SESSION)
    .post(asyncHandler(authController.login.bind(authController)))
    .delete(authController.logout.bind(authController));

  router
    .route(API_ROUTES.AUTH.ME)
    .get(protect, asyncHandler(authController.me.bind(authController)));

  router
    .route(API_ROUTES.AUTH.REGISTER)
    .post(asyncHandler(authController.register.bind(authController)))
    .get(asyncHandler(authController.verifyEmail.bind(authController)));

  router
    .route(API_ROUTES.AUTH.REFRESH)
    .post(asyncHandler(authController.refreshToken.bind(authController)));

  router
    .route(API_ROUTES.AUTH.RESET_PASSWORD)
    .post(asyncHandler(authController.forgotPassword.bind(authController)))
    .get(asyncHandler(authController.verifyResetToken.bind(authController)))
    .put(asyncHandler(authController.resetPassword.bind(authController)));

  router.get(
    API_ROUTES.AUTH.GOOGLE.ROOT,
    authController.googleLogin.bind(authController),
  );
  router.get(
    API_ROUTES.AUTH.GOOGLE.PASSPORT,
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );
  router.get(
    API_ROUTES.AUTH.GOOGLE.CALLBACK,
    passport.authenticate("google", { session: false }),
    authController.googleCallback.bind(authController),
  );

  return router;
}
