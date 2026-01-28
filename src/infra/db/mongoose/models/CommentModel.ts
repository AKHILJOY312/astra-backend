import { Comment, CommentProps } from "@/domain/entities/task/Comment";
import mongoose, { Schema, Types } from "mongoose";

export interface CommentDoc extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  projectId: Types.ObjectId;
  authorId: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDoc>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  { timestamps: true, collection: "comments" },
);

commentSchema.index({ taskId: 1, createAt: 1 });

export const CommentModel = mongoose.model<CommentDoc>(
  "Comment",
  commentSchema,
);

export const toCommentEntity = (doc: CommentDoc): Comment => {
  const props: CommentProps = {
    id: doc._id.toString(),
    taskId: doc.taskId.toString(),
    projectId: doc.projectId.toString(),
    authorId: doc.authorId.toString(),
    message: doc.message,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return new Comment(props);
};
