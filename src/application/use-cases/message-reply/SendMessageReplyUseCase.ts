import {
  MessageReplyResponseDTO,
  SendMessageReplyInputDTO,
} from "@/application/dto/message/messageReplyDTOs";
import { BadRequestError, NotFoundError } from "@/application/error/AppError";
import { IMessageReplyRepository } from "@/application/ports/repositories/IMessageReplyRepository";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { ISendMessageReplyUseCase } from "@/application/ports/use-cases/message-reply";
import { TYPES } from "@/config/di/types";
import { MessageReply } from "@/domain/entities/message/MessageReply";
import { inject, injectable } from "inversify";

@injectable()
export class SendMessageReplyUseCase implements ISendMessageReplyUseCase {
  constructor(
    @inject(TYPES.MessageReplyRepository)
    private _messageReplyRepo: IMessageReplyRepository,
    @inject(TYPES.MessageRepository) private _messageRepo: IMessageRepository,
  ) {}
  async execute(
    input: SendMessageReplyInputDTO,
  ): Promise<MessageReplyResponseDTO> {
    const message = await this._messageRepo.findById(input.parentMessageId);
    if (!message) {
      throw new NotFoundError("Message");
    }
    if (!message.hasReplies) {
      await this._messageRepo.updateHasReply(input.parentMessageId);
    }
    const reply = new MessageReply({
      id: "",
      parentMessageId: input.parentMessageId,
      channelId: input.channelId,
      senderId: input.senderId,
      text: input.text,
      createdAt: new Date().toString(),
      projectId: input.projectId,
    });

    if (reply.isTextEmpty()) {
      throw new BadRequestError("Reply text cannot be empty.");
    }

    const savedReply = await this._messageReplyRepo.create(reply);

    return this.mapResponse(savedReply);
  }

  private mapResponse(reply: MessageReply): MessageReplyResponseDTO {
    return {
      id: reply.id,
      parentMessageId: reply.parentMessageId,
      senderId: reply.senderId,
      text: reply.text,
      createdAt: reply.createdAt.toISOString(),
    };
  }
}
