import { Router } from "express";
import { container } from "../../../config/container";

import { getAuthRoutes } from "./authRoutes";
import { getAdminAuthRoutes } from "./admin/adminAuthRoutes";
import { getAdminPlanRoutes } from "./admin/planRoutes";
import { getAdminUserRoutes } from "./admin/adminUsersRoutes";
import { getProjectRoutes } from "./projectRoutes";
import { getChannelRoutes } from "./channelRoutes";
import { getSubscriptionRoutes } from "./subscriptionRoutes";

const router = Router();

router.use((req, res, next) => {
  console.log("req.body:", req.body);
  next();
});

router.use("/auth", getAuthRoutes(container));

router.use("/admin/auth", getAdminAuthRoutes(container));
router.use("/admin/plans", getAdminPlanRoutes(container));
router.use("/admin/users", getAdminUserRoutes(container));

router.use("/projects", getProjectRoutes(container));
router.use("/projects/:projectId/channels", getChannelRoutes(container));
router.use("/subscription", getSubscriptionRoutes(container));

export default router;
