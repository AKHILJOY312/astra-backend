// // src/interfaces/http/validators/projectValidators.ts
import { z } from "zod";

// export const createProjectSchema = z.object({
//   body: z.object({
//     projectName: z.string().min(1).max(100),
//     description: z.string().optional(),
//     imageUrl: z.string().url().optional().nullable(),
//   }),
// });

// export const addMemberSchema = z.object({
//   body: z.object({
//     projectId: z.string(),
//     userId: z.string(),
//     role: z.enum(["member", "lead", "manager"]).optional(),
//   }),
// });
export const CreateProjectSchema = z.object({
  projectName: z.string().min(1).max(100),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const UpdateProjectSchema = z.object({
  projectName: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(30).default(8),
  search: z.string().optional(),
});
