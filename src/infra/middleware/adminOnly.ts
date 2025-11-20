// src/interfaces/middleware/adminOnly.ts
import { Request, Response, NextFunction } from "express";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Access denied. No authentication." });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required." });
  }

  next();
};
