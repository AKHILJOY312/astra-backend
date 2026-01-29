import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";

import { MessageController } from "@/interface-adapters/controllers/message/MessageController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";

export function getAttachmentRoutes(container: Container): Router {
  const router = Router();

  const messageController = container.get<MessageController>(
    TYPES.MessageController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect);

  router
    .route(API_ROUTES.ATTACHMENT.ATTACHMENT_ACCESS_URL)
    .get(asyncHandler(messageController.getAttachmentsAccessUrl));
  return router;
}
