import { Message } from "@/domain/entities/message/Message";

export interface IMessageRepository {
  create(msg: Message): Promise<Message>;
  listByChannel(
    channelId: string,
    cursor?: string,
    limit?: number,
  ): Promise<Message[]>;
  findById(id: string): Promise<Message | null>;
  updateHasReply(messageId: string): void;
}
