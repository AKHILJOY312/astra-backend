import { z } from "zod";
import { passwordSchema } from "./baseValidators";

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: passwordSchema, // Use your reusable complexity schema here!
});
