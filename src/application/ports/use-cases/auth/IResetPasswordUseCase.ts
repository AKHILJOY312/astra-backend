// src/application/ports/useCases/IResetPassword.ts
export interface IResetPassword {
  execute(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ message: string; role: "admin" | "user" }>;
}
