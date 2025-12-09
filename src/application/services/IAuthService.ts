// src/domain/interfaces/IAuthService.ts
export interface IAuthService {
  hashPassword(plain: string): Promise<string>;
  comparePassword(plain: string, hash: string): Promise<boolean>;

  generateAccessToken(userId: string, email: string): string;
  generateRefreshToken(userId: string): string;

  /** Returns decoded payload or null if invalid */
  verifyRefreshToken(token: string): { id: string } | null;

  generateRandomPassword(): string;
  invalidateUserSessions(userId: string): Promise<void>;
}
