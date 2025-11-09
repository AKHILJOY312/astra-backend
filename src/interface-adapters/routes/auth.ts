import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  me,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} from "../controllers/auth/AuthController";
import { protect } from "../../frameworks/middleware/protect";

const router = Router();
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/me", protect, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token", verifyResetToken);
export default router;

// import { Router } from "express";

// import { AuthController } from "../controllers/auth/AuthController";

// import { protect } from "../../frameworks/middleware/protect";

// const router = Router();
// const authController = new AuthController();

// router.post("/register", authController.register);
// router.get("/verify-email", authController.verifyEmail);
// router.post("/login", authController.login);
// router.post("/logout", authController.logout);
// router.post("/refresh-token", authController.refreshToken);
// router.get("/me", protect, authController.me);
// router.post("/forgot-password", authController.forgotPassword);
// export default router;
