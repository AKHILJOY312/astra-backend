import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters")
      .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
      .transform((val) => val.trim()),

    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .transform((val) => val.trim()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  // Strip confirmPassword and transform final output
  .transform(({ name, email, password }) => ({
    name,
    email,
    password,
  }));
