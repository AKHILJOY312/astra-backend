import { ITaskAttachmentRepository } from "@/application/ports/repositories/ITaskAttachmentRepository";
import { TasksAttachment } from "@/domain/entities/task/TaskAttachment";
import { injectable } from "inversify";
import {
  TasksAttachmentDoc,
  TasksAttachmentModel,
  toTaskAttachmentEntity,
} from "@/infra/db/mongoose/models/TaskAttachmentModel";

@injectable()
export class TaskAttachmentRepository implements ITaskAttachmentRepository {
  // FIX: Use the Document interface from the model, not the Class
  private toDomain(doc: TasksAttachmentDoc): TasksAttachment {
    return toTaskAttachmentEntity(doc);
  }

  private toPersistence(attachment: TasksAttachment) {
    return {
      taskId: attachment.taskId,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
      fileUrl: attachment.fileUrl,
      thumbnailUrl: attachment.thumbnailUrl,
      uploadedAt: attachment.uploadedAt,
    };
  }

  async create(attachment: TasksAttachment): Promise<TasksAttachment> {
    const doc = await TasksAttachmentModel.create(
      this.toPersistence(attachment),
    );
    return this.toDomain(doc);
  }

  async update(entity: TasksAttachment): Promise<void | TasksAttachment> {
    const updatedDoc = await TasksAttachmentModel.findByIdAndUpdate(
      entity.id,
      { $set: this.toPersistence(entity) },
      { new: true }, // returns the updated document
    );
    if (updatedDoc) return this.toDomain(updatedDoc);
  }

  async delete(id: string): Promise<TasksAttachment | null> {
    const doc = await TasksAttachmentModel.findByIdAndDelete(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<TasksAttachment | null> {
    const doc = await TasksAttachmentModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  async findByTaskId(taskId: string): Promise<TasksAttachment[]> {
    const docs = await TasksAttachmentModel.find({ taskId });
    return docs.map((doc) => this.toDomain(doc));
  }
}
