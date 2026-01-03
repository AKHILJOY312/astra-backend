import { z } from "zod";

// Reusable individual fields
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[A-Za-z\s]+$/, "Name can only contain letters and spaces")
  .transform((val) => val.trim());

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .transform((val) => val.trim());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one number")
  .regex(
    /[ !@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
    "Password must contain at least one special character"
  );
