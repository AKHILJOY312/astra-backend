// src/infrastructure/persistence/mongoose/models/MessageReplyModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import {
  MessageReply,
  MessageReplyProps,
} from "@/domain/entities/message/MessageReply";

// 1. Mongoose Document Interface
export interface MessageReplyDoc extends Document {
  _id: Types.ObjectId;
  parentMessageId: Types.ObjectId;
  channelId: Types.ObjectId;
  projectId: Types.ObjectId;
  senderId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Schema
const messageReplySchema = new Schema<MessageReplyDoc>(
  {
    parentMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true, // Crucial for listing replies by parent message
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true, // Manages createdAt and updatedAt automatically
    collection: "message_replies",
  },
);

// Index for performance when fetching a thread in chronological order
messageReplySchema.index({ parentMessageId: 1, createdAt: 1 });

// 3. Mongoose Model
export const MessageReplyModel = mongoose.model<MessageReplyDoc>(
  "MessageReply",
  messageReplySchema,
);

// 4. Mapper: Persistence to Domain
export const toMessageReplyEntity = (doc: MessageReplyDoc): MessageReply => {
  const props: MessageReplyProps = {
    id: doc._id.toString(),
    parentMessageId: doc.parentMessageId.toString(),
    channelId: doc.channelId.toString(),
    projectId: doc.projectId.toString(),
    senderId: doc.senderId.toString(),
    text: doc.text,
    createdAt: doc.createdAt.toISOString(),
  };

  return new MessageReply(props);
};
