import { TaskPriority, TaskStatus } from "@/domain/entities/task/Task";

/** Create */
export interface CreateTaskDTO {
  projectId: string;
  assignedBy: string;
  assignedTo: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
}

/** Update */
export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  priority?: TaskPriority;
}

/** Change Status */
export interface ChangeTaskStatusDTO {
  taskId: string;
  status: TaskStatus;
}

/** Assign Task */
export interface AssignTaskDTO {
  taskId: string;
  assignedTo: string;
}

/** Response / Read */
export interface TaskDTO {
  id: string;
  projectId: string;
  assignedBy: string;
  assignedTo: string;
  title: string;
  description: string | null;
  hasAttachments: boolean;
  status: TaskStatus;
  dueDate: Date | null;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
}
