// src/infrastructure/persistence/mongoose/models/MessageModel.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  Message,
  MessageProps,
} from "../../../../domain/entities/message/Message"; // Adjust path as needed

// 1. Mongoose Document Interface

interface MessageDoc extends Document {
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
      required: true,
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
  }
);

// Compound index for efficient message retrieval within a channel, sorted by time.
messageSchema.index({ channelId: 1, createdAt: -1 });

// 3. Mongoose Model
export const MessageModel = mongoose.model<MessageDoc>(
  "Message",
  messageSchema
);

export const toMessageEntity = (doc: MessageDoc): Message => {
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
  };

  const message = new Message(props);
  // Note: If your Message entity has an `setId` method like the Channel example,
  // you would call it here. Assuming for now the ID is passed through props.
  return message;
};
