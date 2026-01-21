import { z } from "zod";
// No need for TaskStatus/TaskPriority as values anymore
export const TaskStatusEnum = ["todo", "inprogress", "done"] as const;
export const TaskPriorityEnum = ["low", "medium", "high", "critical"] as const; // adjust values

// Optional: also keep the type for type-safety
export type TaskStatus = (typeof TaskStatusEnum)[number];
export type TaskPriority = (typeof TaskPriorityEnum)[number];

/**
 * CREATE TASK
 * POST /projects/:projectId/tasks
 */
export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  assignedTo: z.string().min(1, "Assigned user is required"),
  priority: z.enum(TaskPriorityEnum),
  dueDate: z.string().datetime().optional(),
  attachments: z
    .array(
      z.object({
        fileName: z.string().min(1),
        fileType: z.string().min(1),
        fileUrl: z.string().min(5),
        fileSize: z.number().positive(),
      }),
    )
    .optional(),
});

/**
 * UPDATE TASK STATUS
 * PATCH /tasks/:taskId/status
 */
export const UpdateTaskStatusSchema = z.object({
  status: z.enum(TaskStatusEnum),
});

/**
 * LIST TASKS (QUERY PARAMS)
 * GET /projects/:projectId/tasks
 */
export const ListTasksQuerySchema = z.object({
  status: z.enum(TaskStatusEnum).optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(TaskPriorityEnum).optional(),
  dueBefore: z.string().datetime().optional(),
  dueAfter: z.string().datetime().optional(),
});

/**
 * ATTACHMENT UPLOAD URL
 * POST /projects/:projectId/tasks/attachments/upload-url
 */
export const AttachmentUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.string().min(1, "File type is required"),
});

/**
 * SEARCH PROJECT MEMBERS
 * GET /projects/:projectId/tasks/members/search
 */
export const SearchMembersSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});
