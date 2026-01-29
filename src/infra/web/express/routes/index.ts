import { Router } from "express";
import { container } from "@/config/di/container";

import { getAuthRoutes } from "./auth.routes";
import { getAdminAuthRoutes } from "./admin/adminAuthRoutes";
import { getAdminPlanRoutes } from "./admin/planRoutes";
import { getAdminUserRoutes } from "./admin/adminUsersRoutes";
import { getProjectRoutes } from "./project.routes";
import { getChannelRoutes } from "./channel.routes";
import { getSubscriptionRoutes } from "./subscription.routes";
import { getUserRoutes } from "./user.routes";
import { API_ROUTES } from "@/config/routes.config";
import { getAttachmentRoutes } from "./attachment.routes";
import { getMeetingRoutes } from "./meeting.routes";
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
router.use(API_ROUTES.MEETING.ROOT, getMeetingRoutes(container));
export default router;
