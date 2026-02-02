import {
  AddCommentRequestDTO,
  CommentResponseDTO,
} from "@/application/dto/task/commentDto";
import {
  CreateTaskRequestDTO,
  UpdateTaskRequestDTO,
  UpdateTaskStatusRequestDTO,
  TaskResponseDTO,
  PresignedUrlResponseDTO,
  SearchMembersRequestDTO,
  MemberSearchResponseDTO,
  GetTaskAttachmentDownloadUrlOutput,
  GetTaskRequestDTO,
  AllProjectTasksDTO,
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
  pageInfo: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}
export interface IGetProjectTasksUseCase {
  execute(input: GetTaskRequestDTO): Promise<ProjectTasksResponse>;
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

export interface IAddCommentUseCase {
  execute(
    input: AddCommentRequestDTO,
    userId: string,
  ): Promise<CommentResponseDTO>;
}

export interface IGetAllProjectTasksUseCase {
  execute(userId: string): Promise<AllProjectTasksDTO>;
}
