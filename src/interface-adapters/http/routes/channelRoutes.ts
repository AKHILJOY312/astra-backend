// src/interfaces/http/routes/channelRoutes.ts
import { Router } from "express";
import {
  channelController,
  messageController,
} from "../../../config/container";
import { protect } from "../../../config/container";

const router = Router({ mergeParams: true });

router.use(protect);

// Channel routes (nested under project)

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

//getting the message for channels
// GET /:projectId/channels/:channelId/message?cursor=...&limit=20 — get messages (cursor-based)
router.get(
  "/:channelId/messages",
  messageController.listMessagesPerChannel.bind(messageController)
);
export default router;
