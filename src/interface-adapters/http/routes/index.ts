// src/interfaces/http/routes/index.ts
import { Router } from "express";
import AuthRoutes from "./authRoutes";
import adminAuthRoutes from "./admin/adminAuthRoutes";
import adminPlanRoutes from "./admin/planRoutes";
import adminUserRoutes from "./admin/adminUsersRoutes";

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
router.use("/admin/plans", adminPlanRoutes);
router.use("/admin/users", adminUserRoutes);
// Protected user routes
router.use("/projects", projectRoutes);
router.use("/projects/:projectId/channels", channelRoutes);
router.use("/subscription", subscriptionRoutes);
// router.use("/plans", planRoutes);
export default router;
