// src/infrastructure/persistence/mongoose/models/MessageModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { Message, MessageProps } from "@/domain/entities/message/Message"; // Adjust path as needed
import { AttachmentDoc } from "./AttachmentModel";

// 1. Mongoose Document Interface

export interface MessageDoc extends Document {
  _id: Types.ObjectId;
  channelId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  hasAttachments: boolean;
  hasReplies: boolean;
  senderName: string;
  // Mongoose auto-generates these fields when 'timestamps: true' is used
  createdAt: Date;
  updatedAt: Date;
}

// 2. Mongoose Schema
const messageSchema = new Schema<MessageDoc>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      index: true, // Index for fast lookup by channel
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    text: {
      type: String,

      maxlength: 2000, // A common limit for message length
    },
    hasAttachments: {
      type: Boolean,
      default: false,
      required: true,
    },
    hasReplies: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  {
    timestamps: true, // Auto-adds createdAt and updatedAt fields
    collection: "messages", // Explicitly define collection name
  },
);

// Compound index for efficient message retrieval within a channel, sorted by time.
messageSchema.index({ channelId: 1, createdAt: -1 });
messageSchema.virtual("attachments", {
  ref: "Attachment",
  localField: "_id",
  foreignField: "messageId",
  justOne: false,
});

messageSchema.set("toObject", { virtuals: true });
messageSchema.set("toJSON", { virtuals: true });
// 3. Mongoose Model
export const MessageModel = mongoose.model<MessageDoc>(
  "Message",
  messageSchema,
);

export type MessageDocWithAttachments = MessageDoc & {
  attachments?: AttachmentDoc[];
};

export const toMessageEntity = (doc: MessageDocWithAttachments): Message => {
  const props: MessageProps = {
    id: doc._id.toString(),
    channelId: doc.channelId.toString(),
    senderId: doc.senderId.toString(),
    text: doc.text,
    senderName: doc.senderName,
    hasAttachments: doc.hasAttachments,
    hasReplies: doc.hasReplies,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    attachments: doc.attachments?.map((att) => ({
      id: att._id.toString(),
      messageId: att.messageId.toString(),
      uploadedBy: att.uploadedBy.toString(),
      fileName: att.fileName,
      fileType: att.fileType,
      fileSize: att.fileSize,
      fileUrl: att.fileUrl,
      thumbnailUrl: att.thumbnailUrl,
      uploadedAt: att.uploadedAt.toISOString(),
    })),
  };

  return new Message(props);
};
