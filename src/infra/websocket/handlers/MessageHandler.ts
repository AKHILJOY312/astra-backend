// src/infra/web/socket/handlers/MessageHandler.ts
import { AuthenticatedSocket, BaseSocketHandler } from "./BaseSocketHandler";
import { BadRequestError } from "@/application/error/AppError";
import { Server } from "socket.io";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { AttachmentInput } from "@/application/dto/message/messageDtos";
import { ISendMessageReplyUseCase } from "@/application/ports/use-cases/message-reply";
import { logger } from "@/infra/logger/logger";
import { SendMessageReplyInputDTO } from "@/application/dto/message/messageReplyDTOs";

interface SendMessagePayload {
  channelId: string;
  projectId: string;
  text: string;
  attachments?: AttachmentInput[];
}

interface SendReplyPayload {
  projectId: string;
  channelId: string;
  parentMessageId: string;
  senderId: string;
  text: string;
}

export class MessageHandler extends BaseSocketHandler {
  constructor(
    socket: AuthenticatedSocket,
    private sendMessageUC: ISendMessageUseCase,
    private sendMessageReplyUC: ISendMessageReplyUseCase,
    private io: Server,
  ) {
    super(socket);
  }

  handle(): void {
    this.socket.on("message:send", async (payload: SendMessagePayload) => {
      const userId = this.socket.data.user.id;
      if (!payload?.channelId || !payload?.projectId) {
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
        this.handleError(err, "Failed to send message");
      }
    });

    //messageReply
    this.socket.on("message:reply", async (payload: SendReplyPayload) => {
      const userId = this.socket.data.user.id;

      if (!payload?.channelId || !payload?.parentMessageId || !payload?.text) {
        this.socket.emit("message:error", "Invalid reply payload");
        return;
      }
      try {
        const replyDTO: SendMessageReplyInputDTO = {
          projectId: payload.projectId,
          channelId: payload.channelId,
          parentMessageId: payload.parentMessageId,
          senderId: userId,
          text: payload.text.trim(),
        };

        const reply = await this.sendMessageReplyUC.execute(replyDTO);

        // Broadcast the reply to everyone in the channel
        this.io.to(payload.channelId).emit("message:reply:new", reply);
      } catch (err) {
        this.handleError(err, "Failed to send reply");
      }
    });
  }

  private handleError(err: unknown, defaultMsg: string): void {
    const errorMsg = err instanceof BadRequestError ? err.message : defaultMsg;
    this.socket.emit("message:error", errorMsg);
    logger.error(`[MessageHandler Error]: `, err);
  }
}
