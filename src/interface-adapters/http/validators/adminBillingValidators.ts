import { z } from "zod";

export const UserIdBodySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const PaymentOverviewQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int("Page must be an integer")
      .positive("Page must be at least 1")
      .default(1),

    limit: z.coerce
      .number()
      .int("Limit must be an integer")
      .positive("Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),

    search: z.string().optional(),
  })
  .strict();

export const AnalyticsPeriodQuerySchema = z
  .object({
    period: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  })
  .strict();
