// src/infrastructure/auth/JwtAuthService.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthService } from "../../application/services/IAuthService";
import crypto from "crypto";
import { IUserRepository } from "@/application/repositories/IUserRepository";

export class JwtAuthService implements IAuthService {
  constructor(private userRepo: IUserRepository) {}

  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  generateAccessToken(userId: string, email: string): string {
    const securityStamp = crypto.randomBytes(32).toString("hex");
    return jwt.sign(
      { id: userId, email, stamp: securityStamp },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "1d",
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
    // Implementation depends on how sessions are managed (e.g., token blacklist, session store)
    // This is a placeholder for actual implementation
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const newStamp = crypto.randomBytes(32).toString("hex");

    await this.userRepo.updateSecurityStamp(userId, newStamp);
    return;
  }
}
