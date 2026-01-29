import { FilterQuery, HydratedDocument } from "mongoose";
import { Task } from "@/domain/entities/task/Task";
import { TaskStatus } from "@/domain/entities/task/Task";
import { ITaskRepository } from "@/application/ports/repositories/ITaskRepository";
import {
  TaskDoc,
  TaskModel,
  toTaskEntity,
} from "@/infra/db/mongoose/models/TaskModel";

export class TaskRepository implements ITaskRepository {
  // Mongo → Domain
  private toDomain(doc: HydratedDocument<TaskDoc>): Task {
    return toTaskEntity(doc);
  }

  // Domain → Mongo
  private toPersistence(task: Task): Partial<TaskDoc> {
    return {
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      hasAttachments: task.hasAttachments,
    };
  }

  async create(task: Task): Promise<Task> {
    const doc = await TaskModel.create(this.toPersistence(task));
    return this.toDomain(doc);
  }

  async update(task: Task): Promise<void> {
    await TaskModel.updateOne(
      { _id: task.id, isDeleted: false },
      { $set: this.toPersistence(task) },
    );
  }

  async delete(id: string): Promise<Task | null> {
    return this.softDelete(id).then(() => null);
  }

  async softDelete(taskId: string): Promise<void> {
    console.log("taskId for sofrDetal", taskId);
    await TaskModel.updateOne(
      { _id: taskId, isDeleted: false },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );
  }

  async findById(id: string): Promise<Task | null> {
    const doc = await TaskModel.findOne({ _id: id, isDeleted: false });
    return doc ? this.toDomain(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const docs = await TaskModel.find({
      projectId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return docs.map((d) => this.toDomain(d));
  }

  async findByAssignedTo(userId: string): Promise<Task[]> {
    const docs = await TaskModel.find({
      assignedTo: userId,
      isDeleted: false,
    }).sort({ dueDate: 1 });

    return docs.map((d) => this.toDomain(d));
  }

  async findByProjectAndStatusPaginated(
    projectId: string,

    limit: number,
    status: TaskStatus,
    cursor?: Date,
    assignedTo?: string,
  ): Promise<{ tasks: Task[]; hasMore: boolean }> {
    const query: FilterQuery<TaskDoc> = {
      projectId,
      status,
      isDeleted: false,
    };
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (cursor) {
      query.createdAt = { $lt: cursor };
    }
    const docs = await TaskModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);
    const hasMore = docs.length > limit;
    const sliced = hasMore ? docs.slice(0, limit) : docs;

    return { tasks: sliced.map((d) => this.toDomain(d)), hasMore };
  }
}
