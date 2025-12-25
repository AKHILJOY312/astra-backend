// src/application/ports/useCases/IAdminForgotPassword.ts
export interface IAdminForgotPassword {
  execute(email: string): Promise<{ message: string }>;
}
