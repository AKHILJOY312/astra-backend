import {
  CreateTaskRequestDTO,
  UpdateTaskRequestDTO,
  UpdateTaskStatusRequestDTO,
  TaskResponseDTO,
  PresignedUrlResponseDTO,
  SearchMembersRequestDTO,
  MemberSearchResponseDTO,
  GetTaskAttachmentDownloadUrlOutput,
} from "@/application/dto/task/taskDto";

/* ─────────────────────────────
   Manager Use Cases
   ───────────────────────────── */

export interface ICreateTaskUseCase {
  execute(
    input: CreateTaskRequestDTO,
    managerId: string,
  ): Promise<TaskResponseDTO>;
}

export interface IUpdateTaskUseCase {
  execute(
    taskId: string,
    input: UpdateTaskRequestDTO,
    managerId: string,
  ): Promise<TaskResponseDTO>;
}

export interface IDeleteTaskUseCase {
  execute(taskId: string, managerId: string): Promise<void>;
}
// Define this in your interfaces or taskDto.ts
export interface ProjectTasksResponse {
  tasks: TaskResponseDTO[];
  isManager: boolean;
}
export interface IGetProjectTasksUseCase {
  execute(
    projectId: string,
    requesterId: string,
  ): Promise<ProjectTasksResponse>;
}

/* ─────────────────────────────
   Member Use Cases
   ───────────────────────────── */

export interface IGetMyTasksUseCase {
  execute(userId: string): Promise<TaskResponseDTO[]>;
}

export interface IUpdateTaskStatusUseCase {
  execute(
    taskId: string,
    input: UpdateTaskStatusRequestDTO,
    userId: string,
  ): Promise<void>;
}

/* ─────────────────────────────
   Attachments (S3)
   ───────────────────────────── */

export interface IGetAttachmentUploadUrlUseCase {
  execute(
    projectId: string,
    fileName: string,
    fileType: string,
    requesterId: string,
  ): Promise<PresignedUrlResponseDTO>;
}
export interface IGetTaskAttachmentDownloadUrlUseCase {
  execute(attachmentId: string): Promise<GetTaskAttachmentDownloadUrlOutput>;
}
/* ─────────────────────────────
   Search (Independent Use Case)
   ───────────────────────────── */

export interface ISearchProjectMembersUseCase {
  execute(
    input: SearchMembersRequestDTO,
    managerId: string,
  ): Promise<MemberSearchResponseDTO>;
}
