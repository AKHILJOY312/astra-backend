import { TasksAttachment } from "@/domain/entities/task/TaskAttachment";
import mongoose, { Document, Schema, Types } from "mongoose";

export interface TasksAttachmentDoc extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string | null;
  uploadedAt: Date;
}

const tasksAttachmentSchema = new Schema<TasksAttachmentDoc>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    fileName: { type: String, required: true, trim: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    // We use uploadedAt explicitly, but you could also use timestamps: { createdAt: true, updatedAt: false }
    timestamps: false,
  },
);

export const TasksAttachmentModel = mongoose.model<TasksAttachmentDoc>(
  "TasksAttachment",
  tasksAttachmentSchema,
);

export const toTaskAttachmentEntity = (
  doc: TasksAttachmentDoc,
): TasksAttachment => {
  return new TasksAttachment({
    id: doc._id.toString(),
    taskId: doc.taskId.toString(),
    fileName: doc.fileName,
    fileType: doc.fileType,
    fileSize: doc.fileSize,
    fileUrl: doc.fileUrl,
    thumbnailUrl: doc.thumbnailUrl ?? undefined,
    uploadedAt: doc.uploadedAt,
  });
};
