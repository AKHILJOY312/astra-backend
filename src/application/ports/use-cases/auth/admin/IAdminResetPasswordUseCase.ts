// src/application/ports/useCases/IAdminResetPassword.ts
export interface IAdminResetPassword {
  execute(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ message: string }>;
}
