// src/interfaces/middleware/protect.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../application/repositories/IUserRepository";

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
      };
    }
  }
}

/**
 * Factory function to create protect middleware
 * Injects repository at startup (via container)
 */
export const createProtectMiddleware = (userRepo: IUserRepository) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // 1. Get token from header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
      // 2. Verify token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

      // 3. Use repository (Clean Architecture!)
      const user = await userRepo.findById(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      // 4. Attach minimal user data (no password, no tokens)
      req.user = {
        id: user.id!,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  };
};
