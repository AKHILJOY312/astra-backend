import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "@/config/types";
import { ChannelController } from "@/interface-adapters/controllers/channel/ChannelController";
import { MessageController } from "@/interface-adapters/controllers/message/MessageController";
import { createProtectMiddleware } from "@/infra/web/express/middleware/protect";
import { API_ROUTES } from "@/config/routes.config";

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
    .post(channelController.createChannel.bind(channelController))
    .get(
      channelController.listProjectChannelsBasedOnRole.bind(channelController)
    );

  router
    .route(API_ROUTES.CHANNELS.BY_ID)
    .patch(channelController.editChannel.bind(channelController))
    .delete(channelController.deleteChannel.bind(channelController));

  router.get(
    API_ROUTES.CHANNELS.MESSAGES,
    messageController.listMessagesPerChannel.bind(messageController)
  );

  return router;
}
