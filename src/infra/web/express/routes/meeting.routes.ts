import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { MeetingController } from "@/interface-adapters/controllers/meeting/MeetingController";
import { asyncHandler } from "../handler/asyncHandler";
import { API_ROUTES } from "@/config/routes.config";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";

export function getMeetingRoutes(container: Container): Router {
  const router = Router();

  const meetingController = container.get<MeetingController>(
    TYPES.MeetingController,
  );

  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware,
  );

  router.use(protect);

  router
    .route(API_ROUTES.BASE)
    .post(asyncHandler(meetingController.createMeeting));

  router
    .route(API_ROUTES.MEETING.CODE)
    .get(asyncHandler(meetingController.validateMeeting));

  router
    .route(API_ROUTES.MEETING.LEAVE)
    .post(asyncHandler(meetingController.leaveMeeting));

  router
    .route(API_ROUTES.MEETING.TOKEN)
    .get(asyncHandler(meetingController.getToken));

  return router;
}
