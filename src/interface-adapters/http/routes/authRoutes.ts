import { Router } from "express";
import { authController, protect } from "../../../config/container";
import passport from "passport";

const router = Router();

router.post("/register", authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.me);
router.post("/forgot-password", authController.forgotPassword);
router.get("/verify-reset-token", authController.verifyResetToken);
router.post("/reset-password", authController.resetPassword);
// router.get("/google", authController.googleLogin);
// router.get("/google/callback", authController.googleCallback);

router.get("/google", authController.googleLogin);

// This starts Google OAuth
router.get(
  "/google/passport",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// This handles callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  authController.googleCallback
);

export default router;
