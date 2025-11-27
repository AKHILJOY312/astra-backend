// src/interfaces/http/routes/index.ts
import { Router } from "express";
import AuthRoutes from "./authRoutes";
import adminAuthRoutes from "./admin/adminAuthRoutes";
import planRoutes from "./admin/planRoutes";

import projectRoutes from "./projectRoutes";
import channelRoutes from "./channelRoutes";
import subscriptionRoutes from "./subscriptionRoutes";

const router = Router();

router.use((req, res, next) => {
  console.log("req.body:", req.body);
  next();
});
// Public routes
router.use("/auth", AuthRoutes);

// Admin routes
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/plans", planRoutes);

// Protected user routes
router.use("/projects", projectRoutes);
router.use("/channels", channelRoutes);
router.use("/subscription", subscriptionRoutes);

export default router;
