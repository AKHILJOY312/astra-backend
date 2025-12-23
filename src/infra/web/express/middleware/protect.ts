import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../../../application/ports/repositories/IUserRepository";
import {
  AUTH_MESSAGES,
  ERROR_MESSAGES,
} from "@/interface-adapters/http/constants/messages";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { ENV } from "@/config/env.config";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";

interface JwtPayload {
  id: string;
  email: string;
  stamp: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      name: string;
      email: string;
      isAdmin: boolean;
    };
  }
}

export const createProtectMiddleware = (
  userRepo: IUserRepository,
  blacklistService: ITokenBlacklistService
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: AUTH_MESSAGES.ACCESS_DENIED_NO_AUTH });
    }
    console.log(
      "---------------------------------------------------------------------------------"
    );
    try {
      const isBlacklisted = await blacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Token has been revoked. Please login again." });
      }

      const decoded = jwt.verify(token, ENV.JWT.ACCESS_SECRET!) as JwtPayload;

      const user = await userRepo.findById(decoded.id);

      if (!user) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
      }

      if (user.securityStamp !== decoded.stamp) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json({ message: "Token has been revoked. Please login again." });
      }
      req.user = {
        id: user.id!,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.TOKEN_INVALID_OR_EXPIRED });
    }
  };
};
