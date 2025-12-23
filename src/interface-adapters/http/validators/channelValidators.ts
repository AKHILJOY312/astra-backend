import { z } from "zod";

export const CreateChannelSchema = z.object({
  channelName: z.string().min(1),
  description: z.string().optional(),
  visibleToRoles: z.array(z.string()),
  permissionsByRole: z.record(
    z.string(),
    z.enum(["view", "message", "manager"])
  ),
});

export const EditChannelSchema = z.object({
  channelId: z.string(),
  userId: z.string(),
  channelName: z.string().optional(),
  description: z.string().optional(),
  visibleToRoles: z.array(z.string()).optional(),
  permissionsByRole: z
    .record(z.string(), z.enum(["view", "message", "manager"]))
    .optional(),
});
