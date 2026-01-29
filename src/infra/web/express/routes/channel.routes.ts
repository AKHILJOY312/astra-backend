import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/di/types";
import { ChannelController } from "@/interface-adapters/controllers/channel/ChannelController";
import { MessageController } from "@/interface-adapters/controllers/message/MessageController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";
import { asyncHandler } from "../handler/asyncHandler";

export function getChannelRoutes(container: Container): Router {
  const router = Router({ mergeParams: true });

  const channelController = container.get<ChannelController>(
    TYPES.ChannelController
  );
  const messageController = container.get<MessageController>(
    TYPES.MessageController
  );
  const protect = container.get<ReturnType<typeof createProtectMiddleware>>(
    TYPES.ProtectMiddleware
  );

  router.use(protect);

  router
    .route(API_ROUTES.CHANNELS.ROOT)
    .post(asyncHandler(channelController.createChannel.bind(channelController)))
    .get(
      asyncHandler(
        channelController.listProjectChannelsBasedOnRole.bind(channelController)
      )
    );

  router
    .route(API_ROUTES.CHANNELS.BY_ID)
    .patch(asyncHandler(channelController.editChannel.bind(channelController)))
    .delete(
      asyncHandler(channelController.deleteChannel.bind(channelController))
    );

  router
    .route(API_ROUTES.CHANNELS.MESSAGES)
    .get(
      asyncHandler(
        messageController.listMessagesPerChannel.bind(messageController)
      )
    );

  router
    .route(API_ROUTES.CHANNELS.ATTACHMENT_UPLOAD_URL)
    .post(asyncHandler(messageController.generateUploadUrl));

  return router;
}
