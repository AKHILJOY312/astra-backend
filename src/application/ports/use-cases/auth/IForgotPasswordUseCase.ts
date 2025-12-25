// src/application/ports/useCases/IForgotPassword.ts

export interface IForgotPassword {
  execute(email: string): Promise<{ message: string }>;
}
