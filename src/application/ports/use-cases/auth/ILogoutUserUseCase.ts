// src/application/ports/useCases/ILogoutUser.ts
export interface ILogoutUser {
  execute(refreshToken: string, expiresAt: Date): Promise<{ message: string }>;
}
