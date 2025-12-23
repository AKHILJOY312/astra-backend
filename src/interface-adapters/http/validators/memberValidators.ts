import { z } from "zod";

export const AddMemberSchema = z.object({
  userEmail: z.string().email(),
  role: z.enum(["member", "lead", "manager"]).optional().default("member"),
});

export const ChangeRoleSchema = z.object({
  role: z.enum(["member", "lead", "manager"]),
});
