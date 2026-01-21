import {
  UpdateTaskRequestDTO,
  TaskResponseDTO,
} from "@/application/dto/task/taskDto";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { ITaskAttachmentRepository } from "@/application/ports/repositories/ITaskAttachmentRepository";
import { ITaskRepository } from "@/application/ports/repositories/ITaskRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUpdateTaskUseCase } from "@/application/ports/use-cases/task/interfaces";
import { TYPES } from "@/config/di/types";
import { Task } from "@/domain/entities/task/Task";
import { TasksAttachment } from "@/domain/entities/task/TaskAttachment";
import { inject, injectable } from "inversify";

@injectable()
export class UpdateTaskUseCase implements IUpdateTaskUseCase {
  constructor(
    @inject(TYPES.TaskRepository) private taskRepo: ITaskRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.TaskAttachmentRepository)
    private taskAttachmentRepo: ITaskAttachmentRepository,
  ) {}

  async execute(
    taskId: string,
    input: UpdateTaskRequestDTO,
    managerId: string,
  ): Promise<TaskResponseDTO> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new NotFoundError("Task");
    //1.Manger authorization
    const membership = await this.membershipRepo.findByProjectAndUser(
      task.projectId,
      managerId,
    );
    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only mangers can update tasks");
    }

    //2. Reassignment validation
    if (input.assignedTo) {
      const assignee = await this.membershipRepo.findByProjectAndUser(
        task.projectId,
        input.assignedTo,
      );
      if (!assignee) {
        throw new BadRequestError("Assignee must be a project member");
      }
      task.assignTo(input.assignedTo);
    }

    //3. Metadata updates
    if (input.title) task.updateTitle(input.title);
    if (input.description !== undefined)
      task.updateDescription(input.description);
    if (input.priority) task.changePriority(input.priority);
    if (input.dueDate !== undefined)
      task.setDueDate(input.dueDate ? new Date(input.dueDate) : null);
    task.setUpdatedAt(new Date());

    const update = await this.taskRepo.update(task);
    return this.mapToResponse(update!);
  }
  private async mapToResponse(task: Task): Promise<TaskResponseDTO> {
    const [user, attachments] = await Promise.all([
      this.userRepo.findById(task.assignedTo),
      task.hasAttachments
        ? this.taskAttachmentRepo.findByTaskId(task.id!)
        : Promise.resolve([] as TasksAttachment[]),
    ]);

    return {
      id: task.id!,
      projectId: task.projectId,
      assignedTo: {
        id: task.assignedTo.toString(),
        name: user?.name || "Unknown User",
        email: user?.email,
        avatarUrl: user?.ImageUrl,
      },
      title: task.title,
      description: task.description ?? null,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate?.toISOString() ?? null,
      hasAttachments: task.hasAttachments ?? false,
      attachments: (attachments || []).map((att: TasksAttachment) => ({
        id: att.id!,
        fileName: att.fileName,
        fileType: att.fileType,
        fileSize: att.fileSize,
        fileUrl: att.fileUrl,
        thumbnailUrl: att.thumbnailUrl ?? null,
      })),

      createdAt: task.createdAt.toISOString(),
    };
  }
}
