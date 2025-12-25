// src/application/ports/useCases/IVerifyEmail.ts
export interface IVerifyEmail {
  execute(token: string): Promise<{ message: string }>;
}
