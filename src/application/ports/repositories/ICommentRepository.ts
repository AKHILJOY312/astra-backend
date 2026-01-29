import { Comment } from "@/domain/entities/task/Comment";

export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  listByTask(
    taskId: string,
    cursor?: string,
    limit?: number,
  ): Promise<Comment[]>;
  findById(id: string): Promise<Comment | null>;
  delete(id: string): Promise<boolean>;
  update(id: string, message: string): Promise<Comment | null>;
}
