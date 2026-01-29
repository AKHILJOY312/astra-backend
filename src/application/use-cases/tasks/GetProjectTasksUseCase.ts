import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/application/error/AppError";

import {
  GetTaskRequestDTO,
  TaskResponseDTO,
} from "@/application/dto/task/taskDto";
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
import { ICommentRepository } from "@/application/ports/repositories/ICommentRepository";

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
    @inject(TYPES.CommentRepository) private commentRepo: ICommentRepository,
  ) {}

  async execute({
    projectId,
    requesterId,
    status,
    cursor,
    limit = 10,
  }: GetTaskRequestDTO): Promise<ProjectTasksResponse> {
    // 1. Must be project member
    const membership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requesterId,
    );

    if (!membership) {
      throw new UnauthorizedError("You are not a project member");
    }
    const isManager = membership.role === "manager";
    // 2. Load tasks
    const { tasks, hasMore } =
      await this.taskRepo.findByProjectAndStatusPaginated(
        projectId,
        limit,
        status,

        cursor ? new Date(cursor) : undefined,
        isManager ? undefined : requesterId,
      );

    // 3. Map to response DTO
    const dtos = await Promise.all(
      tasks.map((task) => this.mapToResponse(task)),
    );
    return {
      tasks: dtos,
      isManager,
      pageInfo: {
        hasMore,
        nextCursor: dtos.length > 0 ? dtos[dtos.length - 1].createdAt : null,
      },
    };
  }

  private async mapToResponse(task: Task): Promise<TaskResponseDTO> {
    const [user, attachments, rawComments] = await Promise.all([
      this.userRepo.findById(task.assignedTo),
      task.hasAttachments
        ? this.taskAttachmentRepo.findByTaskId(task.id!)
        : Promise.resolve([] as TasksAttachment[]),
      this.commentRepo.listByTask(task.id!),
    ]);

    const commentsWithAuthors = await Promise.all(
      rawComments.map(async (cmd) => {
        const author = await this.userRepo.findById(cmd.authorId);
        return {
          id: cmd.id!,
          taskId: cmd.taskId,
          projectId: cmd.projectId,
          author: {
            id: cmd.authorId,
            name: author?.name || "Unknown User",
            email: author?.email,
            avatarUrl: author?.ImageUrl,
          },
          message: cmd.message,
          createdAt: cmd.createdAt.toISOString(),
          updatedAt: cmd.updatedAt.toISOString(),
        };
      }),
    );

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
      comments: commentsWithAuthors,
      createdAt: task.createdAt.toISOString(),
    };
  }
}
