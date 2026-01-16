// src/infra/web/socket/handlers/MessageHandler.ts
import { AuthenticatedSocket, BaseSocketHandler } from "./BaseSocketHandler";
import { BadRequestError } from "@/application/error/AppError";
import { Server } from "socket.io";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { AttachmentInput } from "@/application/dto/message/messageDtos";

interface SendMessagePayload {
  channelId: string;
  projectId: string;
  text: string;
  attachments?: AttachmentInput[];
}

export class MessageHandler extends BaseSocketHandler {
  constructor(
    socket: AuthenticatedSocket,
    private sendMessageUC: ISendMessageUseCase,
    private io: Server
  ) {
    super(socket);
  }

  handle(): void {
    this.socket.on("message:send", async (payload: SendMessagePayload) => {
      const userId = this.socket.data.user.id;
      if (!payload?.channelId || !payload?.projectId || !payload.text?.trim()) {
        this.socket.emit("message:error", "Invalid message payload");
        return;
      }

      try {
        const message = await this.sendMessageUC.execute({
          channelId: payload.channelId,
          projectId: payload.projectId,
          text: payload.text.trim(),
          senderId: userId,
          attachments: payload.attachments,
        });

        // Broadcast to room
        this.io.to(payload.channelId).emit("message:new", message);
      } catch (err) {
        const errorMsg =
          err instanceof BadRequestError
            ? err.message
            : "Failed to send message";
        this.socket.emit("message:error", errorMsg);
      }
    });
  }
}
