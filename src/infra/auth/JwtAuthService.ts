// src/infrastructure/auth/JwtAuthService.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthService } from "../../application/ports/services/IAuthService";
import crypto from "crypto";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class JwtAuthService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  generateAccessToken(
    userId: string,
    email: string,
    securityStamp: string
  ): string {
    return jwt.sign(
      { id: userId, email, stamp: securityStamp },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "7d",
      }
    );
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });
  }

  verifyRefreshToken(token: string): { id: string } | null {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as {
        id: string;
      };
    } catch {
      return null;
    }
  }

  generateRandomPassword(length = 16): string {
    return crypto.randomBytes(length).toString("hex");
  }

  async invalidateUserSessions(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    console.log("Users: ", user);
    if (!user) throw new Error("User not found");

    const newStamp = crypto.randomBytes(32).toString("hex");

    await this.userRepo.updateSecurityStamp(userId, newStamp);
    return;
  }
}
