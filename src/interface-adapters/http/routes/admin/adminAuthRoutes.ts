// src/interfaces/http/routes/adminAuthRoutes.ts
import { Router } from "express";
import { adminAuthController } from "../../../../config/container";

const router = Router();

router.post("/login", adminAuthController.login);
router.post("/forgot-password", adminAuthController.forgotPassword);
router.post("/reset-password", adminAuthController.resetPassword);

export default router;
