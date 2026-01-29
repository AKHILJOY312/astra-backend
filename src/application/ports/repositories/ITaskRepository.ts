import { Task } from "@/domain/entities/task/Task";
import { IBaseRepository } from "./IBaseRepository";
import { TaskStatus } from "@/domain/entities/task/Task";

export interface ITaskRepository extends IBaseRepository<Task> {
  /**
   * Returns a task by id.
   * Must NOT return soft-deleted tasks.
   */
  findById(id: string): Promise<Task | null>;

  /**
   * Returns all non-deleted tasks for a project.
   * Used by Kanban and Manager views.
   */
  findByProjectId(projectId: string): Promise<Task[]>;

  /**
   * Returns all non-deleted tasks assigned to a user.
   * Optimization for "My Tasks".
   */
  findByAssignedTo(userId: string): Promise<Task[]>;

  /**
   * Returns tasks by project and status.
   * Critical for Kanban column loading.
   */
  findByProjectAndStatusPaginated(
    projectId: string,

    limit: number,
    status: TaskStatus,
    cursor?: Date,
    assignedTo?: string,
  ): Promise<{ tasks: Task[]; hasMore: boolean }>;

  /**
   * Soft delete:
   * - Sets isDeleted = true
   * - Sets deletedAt
   */
  softDelete(taskId: string): Promise<void>;
}
