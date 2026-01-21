import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/application/error/AppError";

import { TaskResponseDTO } from "@/application/dto/task/taskDto";
import { Task } from "@/domain/entities/task/Task";
import {
  IGetProjectTasksUseCase,
  ProjectTasksResponse,
} from "@/application/ports/use-cases/task/interfaces";
import { ITaskRepository } from "@/application/ports/repositories/ITaskRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { ITaskAttachmentRepository } from "@/application/ports/repositories/ITaskAttachmentRepository";
import { TasksAttachment } from "@/domain/entities/task/TaskAttachment";

@injectable()
export class GetProjectTasksUseCase implements IGetProjectTasksUseCase {
  constructor(
    @inject(TYPES.TaskRepository)
    private taskRepo: ITaskRepository,

    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.TaskAttachmentRepository)
    private taskAttachmentRepo: ITaskAttachmentRepository,
  ) {}

  async execute(
    projectId: string,
    requesterId: string,
  ): Promise<ProjectTasksResponse> {
    // 1. Must be project member
    const membership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requesterId,
    );

    if (!membership) {
      throw new UnauthorizedError("You are not a project member");
    }
    const isManger = membership.role === "manager";
    // 2. Load tasks
    const tasks =
      membership.role === "manager"
        ? await this.taskRepo.findByProjectId(projectId)
        : await this.taskRepo.findByAssignedTo(requesterId);

    // 3. Map to response DTO
    const dtos = await Promise.all(
      tasks.map((task) => this.mapToResponse(task)),
    );
    return { tasks: dtos, isManager: isManger };
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
