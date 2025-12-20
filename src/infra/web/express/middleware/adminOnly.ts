// src/interfaces/middleware/adminOnly.ts
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { AUTH_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { Request, Response, NextFunction } from "express";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: AUTH_MESSAGES.ACCESS_DENIED_NO_AUTH });
  }

  if (!req.user.isAdmin) {
    return res
      .status(HTTP_STATUS.FORBIDDEN)
      .json({ message: AUTH_MESSAGES.ADMIN_ACCESS_REQUIRED });
  }

  next();
};
