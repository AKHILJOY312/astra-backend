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
        isAdmin: boolean;
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

    // Add this at the very beginning of your middleware for full visibility
    console.log("=== INCOMING REQUEST DEBUG ===");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl || req.url);
    console.log("Headers:", req.headers);
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Token extracted:", token);
    console.log("Body:", req.body);
    console.log("Query:", req.query);
    console.log("Cookies:", req.cookies);
    console.log("==================================");

    // 1. Get token from header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log(req.header);
    console.log("1");
    console.log(token);
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
    console.log("2");
    try {
      // 2. Verify token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;
      console.log("3");
      // 3. Use repository
      const user = await userRepo.findById(decoded.id);
      console.log("4");
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      // 4. Attach minimal user data (no password, no tokens)
      req.user = {
        id: user.id!,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  };
};
