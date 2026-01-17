import { Router } from "express";
import { container } from "@/config/di/container";

import { getAuthRoutes } from "./authRoutes";
import { getAdminAuthRoutes } from "./admin/adminAuthRoutes";
import { getAdminPlanRoutes } from "./admin/planRoutes";
import { getAdminUserRoutes } from "./admin/adminUsersRoutes";
import { getProjectRoutes } from "./projectRoutes";
import { getChannelRoutes } from "./channelRoutes";
import { getSubscriptionRoutes } from "./subscriptionRoutes";
import { getUserRoutes } from "./userRoutes";
import { API_ROUTES } from "@/config/routes.config";
import { getAttachmentRoutes } from "./attachmentRoutes";
const router = Router();

router.use((req, res, next) => {
  console.log("req.body:", req.body);
  next();
});

router.use(API_ROUTES.AUTH.ROOT, getAuthRoutes(container));

router.use(API_ROUTES.ADMIN.AUTH, getAdminAuthRoutes(container));
router.use(API_ROUTES.ADMIN.PLANS, getAdminPlanRoutes(container));
router.use(API_ROUTES.ADMIN.USERS, getAdminUserRoutes(container));

router.use(API_ROUTES.USER.ROOT, getUserRoutes(container));
router.use(API_ROUTES.PROJECTS.ROOT, getProjectRoutes(container));
router.use(API_ROUTES.PROJECTS.CHANNELS, getChannelRoutes(container));
router.use(API_ROUTES.ATTACHMENT.ROOT, getAttachmentRoutes(container));
router.use(API_ROUTES.SUBSCRIPTION.ROOT, getSubscriptionRoutes(container));

export default router;
