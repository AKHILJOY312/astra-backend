// src/infra/http/errorMiddleware.ts
import { ErrorRequestHandler } from "express";
import { AppError } from "@/application/error/AppError";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { z, ZodError } from "zod";

export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  if (err instanceof ZodError) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: "Validation failed",
      errors: err.issues.map((issue: z.ZodIssue) => ({
        // Use z.ZodIssue
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Special handling for plan limit errors
  if (err.name === "PlanLimitError") {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      message: err.message,
      upgradeRequired: true,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  console.error("UNHANDLED ERROR:", err);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
  });

  // explicitly mark as used (ESLint-safe)
  next();
};
