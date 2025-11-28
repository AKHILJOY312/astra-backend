// src/infrastructure/auth/JwtAuthService.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { IAuthService } from "../../application/services/IAuthService";
import crypto from "crypto";

export class JwtAuthService implements IAuthService {
  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, process.env.ACCESS_TOKEN_SECRET!, {
      expiresIn: "15m",
    });
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

  // AuthService.ts
  generateRandomPassword(length = 16): string {
    return crypto.randomBytes(length).toString("hex");
  }
}
