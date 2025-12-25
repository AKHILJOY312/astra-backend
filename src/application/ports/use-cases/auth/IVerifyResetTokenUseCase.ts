// src/application/ports/useCases/IVerifyResetToken.ts
export interface IVerifyResetToken {
  execute(token: string): Promise<{ valid: boolean; message?: string }>;
}
