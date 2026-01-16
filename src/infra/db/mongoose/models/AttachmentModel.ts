// src/infrastructure/persistence/mongoose/models/AttachmentModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import {
  Attachment,
  AttachmentProps,
} from "@/domain/entities/message/Attachment";

// 1. Mongoose Document Interface
export interface AttachmentDoc extends Document {
  _id: Types.ObjectId;
  messageId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
}

// 2. Mongoose Schema
const attachmentSchema = new Schema<AttachmentDoc>(
  {
    messageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "uploadedAt", updatedAt: false },
    collection: "attachments",
  }
);

// Indexes for performance
attachmentSchema.index({ messageId: 1, uploadedAt: -1 });

// 3. Mongoose Model
export const AttachmentModel = mongoose.model<AttachmentDoc>(
  "Attachment",
  attachmentSchema
);

// 4. Mapper: Document → Domain Entity
export const toAttachmentEntity = (doc: AttachmentDoc): Attachment => {
  const props: AttachmentProps = {
    id: doc._id.toString(),
    messageId: doc.messageId.toString(),
    uploadedBy: doc.uploadedBy.toString(),
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    fileUrl: doc.fileUrl,
    thumbnailUrl: doc.thumbnailUrl ?? undefined,
    uploadedAt: doc.uploadedAt.toISOString(),
  };

  return new Attachment(props);
};
