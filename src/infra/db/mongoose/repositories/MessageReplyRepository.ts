import { IMessageReplyRepository } from "@/application/ports/repositories/IMessageReplyRepository";
import { MessageReply } from "@/domain/entities/message/MessageReply";
import {
  MessageReplyDoc,
  MessageReplyModel,
  toMessageReplyEntity,
} from "../models/MessageReplyModel";
import { FilterQuery, Types } from "mongoose";

export class MessageReplyRepository implements IMessageReplyRepository {
  async create(msg: MessageReply): Promise<MessageReply> {
    const doc = await MessageReplyModel.create({
      senderId: msg.senderId,
      projectId: msg.projectId,
      channelId: msg.channelId,
      parentMessageId: msg.parentMessageId,
      text: msg.text,
    });

    return toMessageReplyEntity(doc);
  }
  async listByMessage(
    messageId: string,
    limit: number,
    cursor?: string,
  ): Promise<MessageReply[]> {
    const query: FilterQuery<MessageReplyDoc> = {
      parentMessageId: new Types.ObjectId(messageId),
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const docs = await MessageReplyModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return docs.map((doc) => toMessageReplyEntity(doc)).reverse();
  }

  async findById(id: string): Promise<MessageReply | null> {
    const doc = await MessageReplyModel.findById(id).exec();
    return doc ? toMessageReplyEntity(doc) : null;
  }
}
