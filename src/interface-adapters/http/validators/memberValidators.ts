import { z } from "zod";

export const AddMemberSchema = z.object({
  newMemberEmail: z.string().email(),
  role: z.enum(["member", "lead", "manager"]).optional().default("member"),
});

export const ChangeRoleSchema = z.object({
  role: z.enum(["member", "lead", "manager"]),
});
export const AcceptInvitationSchema = z.object({
  token: z.string().min(1, "Invitation token is required"),
});
