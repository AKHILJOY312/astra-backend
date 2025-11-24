// src/interfaces/http/routes/channelRoutes.ts
import { Router } from "express";
import { channelController } from "../../../config/container";
import { protect } from "../../../config/container";

const router = Router();

router.use(protect);

router.post("/", channelController.createChannel.bind(channelController));
// Add more: GET /:projectId/channels, etc.

export default router;
