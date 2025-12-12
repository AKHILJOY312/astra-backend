import { Router } from "express";
import { Container } from "inversify";
import { TYPES } from "../../../config/types";
import { ChannelController } from "../../controllers/channel/ChannelController";
import { MessageController } from "../../controllers/message/MessageController";
import { createProtectMiddleware } from "../../../infra/middleware/protect";

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
    .route("/")
    .post(channelController.createChannel.bind(channelController))
    .get(
      channelController.listProjectChannelsBasedOnRole.bind(channelController)
    );

  router
    .route("/:channelId")
    .patch(channelController.editChannel.bind(channelController))
    .delete(channelController.deleteChannel.bind(channelController));

  router.get(
    "/:channelId/messages",
    messageController.listMessagesPerChannel.bind(messageController)
  );

  return router;
}
