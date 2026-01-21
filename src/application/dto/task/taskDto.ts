import { TaskPriority, TaskStatus } from "@/domain/entities/task/Task";

/** Create */
export interface CreateTaskRequestDTO {
  projectId: string;
  assignedTo: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string; // ISO String
  attachments?: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
  }[];
}

/** Update */
export interface UpdateTaskRequestDTO {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assignedTo?: string; // Reassignment
}
export interface UpdateTaskStatusRequestDTO {
  status: TaskStatus;
}
export interface SearchMembersRequestDTO {
  projectId: string;
  query: string; // Name or email
}

/** Assign Task */
export interface AssignTaskDTO {
  taskId: string;
  assignedTo: string;
}

/**
 * OUTPUT DTOs (Response Payloads)
 */
export interface AttachmentResponseDTO {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string | null;
}
export interface TaskResponseDTO {
  id: string;
  projectId: string;
  assignedTo?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  } | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  hasAttachments: boolean;
  attachments: AttachmentResponseDTO[];
  createdAt: string;
}

export interface PresignedUrlResponseDTO {
  uploadUrl: string;
  fileKey: string; // To be saved in DB after upload
}

export interface MemberSearchResponseDTO {
  members: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  }[];
}
export interface AssignableMemberDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
export interface GetTaskAttachmentDownloadUrlOutput {
  url: string;
  expiresAt: string;
}
