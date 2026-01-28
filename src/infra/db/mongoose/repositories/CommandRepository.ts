import { ICommentRepository } from "@/application/ports/repositories/ICommentRepository";

import {
  CommentDoc,
  CommentModel,
  toCommentEntity,
} from "../models/CommentModel";
import { FilterQuery, Types } from "mongoose";
import { Comment } from "@/domain/entities/task/Comment";

export class CommentRepository implements ICommentRepository {
  async create(comment: Comment): Promise<Comment> {
    const doc = await CommentModel.create({
      taskId: new Types.ObjectId(comment.taskId),
      projectId: new Types.ObjectId(comment.projectId),
      authorId: new Types.ObjectId(comment.authorId),
      message: comment.message,
    });

    return toCommentEntity(doc);
  }

  async listByTask(
    taskId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<Comment[]> {
    const query: FilterQuery<CommentDoc> = {
      taskId: new Types.ObjectId(taskId),
    };

    if (cursor) {
      // Pagination: list comments created after the cursor date
      query.createdAt = { $gt: new Date(cursor) };
    }

    const docs = await CommentModel.find(query)
      .sort({ createdAt: 1 }) // Usually, comments/comments are read in chronological order
      .limit(limit)
      .exec();

    return docs.map(toCommentEntity);
  }

  async findById(id: string): Promise<Comment | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await CommentModel.findById(id).exec();
    return doc ? toCommentEntity(doc) : null;
  }

  async update(id: string, message: string): Promise<Comment | null> {
    const doc = await CommentModel.findByIdAndUpdate(
      id,
      { message, updatedAt: new Date() },
      { new: true },
    ).exec();

    return doc ? toCommentEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await CommentModel.deleteOne({
      _id: new Types.ObjectId(id),
    }).exec();
    return result.deletedCount > 0;
  }
}
