import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { AuthController } from "@/interface-adapters/controllers/auth/AuthController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import passport from "passport";
import { API_ROUTES } from "@/config/routes.config";

export function getAuthRoutes(container: Container): Router {
  const router = Router();

  const authController = container.get<AuthController>(TYPES.AuthController);

  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.post(
    API_ROUTES.AUTH.REGISTER,
    authController.register.bind(authController)
  );
  router.get(
    API_ROUTES.AUTH.VERIFY_EMAIL,
    authController.verifyEmail.bind(authController)
  );
  router.post(API_ROUTES.AUTH.LOGIN, authController.login.bind(authController));
  router.post(
    API_ROUTES.AUTH.REFRESH,
    authController.refreshToken.bind(authController)
  );
  router.post(
    API_ROUTES.AUTH.LOGOUT,
    authController.logout.bind(authController)
  );
  router.get(
    API_ROUTES.AUTH.ME,
    protect,
    authController.me.bind(authController)
  );
  router.post(
    API_ROUTES.AUTH.FORGOT_PASSWORD,
    authController.forgotPassword.bind(authController)
  );
  router.get(
    API_ROUTES.AUTH.VERIFY_RESET_TOKEN,
    authController.verifyResetToken.bind(authController)
  );
  router.post(
    API_ROUTES.AUTH.RESET_PASSWORD,
    authController.resetPassword.bind(authController)
  );

  router.get(
    API_ROUTES.AUTH.GOOGLE.ROOT,
    authController.googleLogin.bind(authController)
  );

  router.get(
    API_ROUTES.AUTH.GOOGLE.PASSPORT,
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  router.get(
    API_ROUTES.AUTH.GOOGLE.CALLBACK,
    passport.authenticate("google", { session: false }),
    authController.googleCallback.bind(authController)
  );

  return router;
}
