import {
  CreateTaskRequestDTO,
  TaskResponseDTO,
} from "@/application/dto/task/taskDto";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { ITaskAttachmentRepository } from "@/application/ports/repositories/ITaskAttachmentRepository";
import { ITaskRepository } from "@/application/ports/repositories/ITaskRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { ICreateTaskUseCase } from "@/application/ports/use-cases/task/interfaces";
import { TYPES } from "@/config/di/types";
import { Task } from "@/domain/entities/task/Task";
import { TasksAttachment } from "@/domain/entities/task/TaskAttachment";
import { inject, injectable } from "inversify";

@injectable()
export class CreateTaskUseCase implements ICreateTaskUseCase {
  constructor(
    @inject(TYPES.TaskRepository) private taskRepo: ITaskRepository,

    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.TaskAttachmentRepository)
    private TaskAttachmentRepo: ITaskAttachmentRepository,
  ) {}
  async execute(
    input: CreateTaskRequestDTO,
    managerId: string,
  ): Promise<TaskResponseDTO> {
    const {
      projectId,
      assignedTo,
      title,
      description,
      priority,
      dueDate,
      attachments,
    } = input;

    //1.Manger check
    const managerMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      managerId,
    );
    if (!managerMembership || managerMembership.role !== "manager") {
      throw new UnauthorizedError("Only mangers and lead can create task");
    }
    //2. assigned user must be project member
    const assigneeMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      assignedTo,
    );

    if (!assigneeMembership) {
      throw new BadRequestError("Assigned user is not a project member");
    }
    const hasAttachments = (attachments?.length ?? 0) > 0;
    //3.Create Task entity
    const task = new Task({
      projectId,
      assignedBy: managerId,
      assignedTo,
      title: title.trim(),
      description,
      status: "todo",
      hasAttachments: hasAttachments,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedTask = await this.taskRepo.create(task);

    if (attachments && attachments.length > 0) {
      const attachmentPromise = attachments.map((att) => {
        const taskAttachment = new TasksAttachment({
          taskId: savedTask.id!,
          fileName: att.fileName,
          fileType: att.fileName,
          fileSize: att.fileSize,
          fileUrl: att.fileUrl,
        });
        return this.TaskAttachmentRepo.create(taskAttachment);
      });
      await Promise.all(attachmentPromise);
    }

    return this.mapToResponse(savedTask);
  }
  private async mapToResponse(task: Task): Promise<TaskResponseDTO> {
    // Fetch user and attachments concurrently
    const [user, attachments] = await Promise.all([
      this.userRepo.findById(task.assignedTo),
      task.hasAttachments
        ? this.TaskAttachmentRepo.findByTaskId(task.id!)
        : Promise.resolve([]),
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

      // Map the domain entities to the DTO format
      attachments: attachments.map((att) => ({
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
