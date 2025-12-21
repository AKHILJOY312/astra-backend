// src/infrastructure/auth/JwtAuthService.ts
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthService } from "../../application/ports/services/IAuthService";
import crypto from "crypto";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { ENV } from "@/config/env.config";

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
    const options: SignOptions = {
      expiresIn: ENV.JWT.ACCESS_EXPIRY as SignOptions["expiresIn"],
    };
    return jwt.sign(
      { id: userId, email, stamp: securityStamp },
      ENV.JWT.ACCESS_SECRET!,
      options
    );
  }

  generateRefreshToken(userId: string): string {
    const options: SignOptions = {
      expiresIn: ENV.JWT.REFRESH_EXPIRY as SignOptions["expiresIn"],
    };
    return jwt.sign({ id: userId }, ENV.JWT.REFRESH_SECRET!, options);
  }

  verifyRefreshToken(token: string): { id: string } | null {
    try {
      return jwt.verify(token, ENV.JWT.REFRESH_SECRET!) as {
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
