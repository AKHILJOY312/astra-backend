import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { Message } from "@/domain/entities/message/Message";
import {
  MessageDoc,
  MessageDocWithAttachments,
  MessageModel,
  toMessageEntity,
} from "../models/MessageModel";
import { FilterQuery, Types } from "mongoose";
import { AttachmentDoc } from "../models/AttachmentModel";

export class MessageRepository implements IMessageRepository {
  async create(msg: Message): Promise<Message> {
    const doc = await MessageModel.create({
      channelId: msg.channelId,
      senderId: msg.senderId,
      text: msg.text,
      senderName: msg.senderName,
      hasAttachments: msg.hasAttachments,
    });
    // console.log("Created Message Document:", doc);
    return toMessageEntity(doc);
  }
  async listByChannel(
    channelId: string,
    cursor?: string,
    limit: number = 20
  ): Promise<Message[]> {
    const query: FilterQuery<MessageDoc> = {
      channelId: new Types.ObjectId(channelId),
    };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const docs = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate<{ attachments: AttachmentDoc[] }>("attachments")
      .exec();

    return docs
      .map((doc) => toMessageEntity(doc as MessageDocWithAttachments))
      .reverse();
  }
  async findById(id: string): Promise<Message | null> {
    const doc = await MessageModel.findById(id).exec();

    return doc ? toMessageEntity(doc) : null;
  }
}
