// src/application/ports/useCases/IRefreshToken.ts
export interface IRefreshToken {
  execute(refreshToken: string): Promise<{ accessToken: string }>;
}
