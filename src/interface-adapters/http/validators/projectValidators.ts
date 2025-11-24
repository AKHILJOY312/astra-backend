// src/interfaces/http/validators/projectValidators.ts
import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    projectName: z.string().min(1).max(100),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().nullable(),
  }),
});

export const addMemberSchema = z.object({
  body: z.object({
    projectId: z.string(),
    userId: z.string(),
    role: z.enum(["member", "lead", "manager"]).optional(),
  }),
});
