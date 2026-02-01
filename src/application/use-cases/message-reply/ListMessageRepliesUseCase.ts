import {
  ListMessageRepliesInput,
  MessageReplyResponseDTO,
} from "@/application/dto/message/messageReplyDTOs";
import { IMessageReplyRepository } from "@/application/ports/repositories/IMessageReplyRepository";
import { IListMessageRepliesUseCase } from "@/application/ports/use-cases/message-reply";
import { TYPES } from "@/config/di/types";
import { MessageReply } from "@/domain/entities/message/MessageReply";
import { inject, injectable } from "inversify";

@injectable()
export class ListMessageRepliesUseCase implements IListMessageRepliesUseCase {
  constructor(
    @inject(TYPES.MessageReplyRepository)
    private _messageReplyRepo: IMessageReplyRepository,
  ) {}

  async execute(
    input: ListMessageRepliesInput,
  ): Promise<MessageReplyResponseDTO[]> {
    // 1. Await the repository call since it's likely an async operation
    const replies = await this._messageReplyRepo.listByMessage(
      input.messageId,

      input.limit,
      input.cursor,
    );

    // 2. Map the domain entities to DTOs
    return this.mapToResponse(replies);
  }

  // 3. Changed 'replies' type to MessageReply[] and removed 'async' as mapping is synchronous
  private mapToResponse(replies: MessageReply[]): MessageReplyResponseDTO[] {
    return replies.map((reply) => ({
      id: reply.id,
      parentMessageId: reply.parentMessageId,
      senderId: reply.senderId,
      text: reply.text,
      createdAt: reply.createdAt.toISOString(),
    }));
  }
}
