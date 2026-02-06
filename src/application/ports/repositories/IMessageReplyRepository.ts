import { MessageReply } from "@/domain/entities/message/MessageReply";

export interface IMessageReplyRepository {
  create(msg: MessageReply): Promise<MessageReply>;
  listByMessage(
    messageId: string,
    limit: number,
    cursor?: string,
  ): Promise<MessageReply[]>;
  findById(id: string): Promise<MessageReply | null>;
}
