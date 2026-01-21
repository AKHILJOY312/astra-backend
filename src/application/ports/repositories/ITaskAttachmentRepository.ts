import { TasksAttachment } from "@/domain/entities/task/TaskAttachment";
import { IBaseRepository } from "./IBaseRepository";

export interface ITaskAttachmentRepository extends IBaseRepository<TasksAttachment> {
  findByFileKey(fileKey: string): Promise<TasksAttachment | null>;
}
