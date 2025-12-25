// src/application/use-cases/ResetPassword.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";
import { IResetPassword } from "@/application/ports/use-cases/auth/IResetPasswordUseCase";

@injectable()
export class ResetPassword implements IResetPassword {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private auth: IAuthService
  ) {}

  async execute(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ message: string; role: "admin" | "user" }> {
    if (!token) throw new Error("Invalid token");
    if (!password || !confirmPassword)
      throw new BadRequestError("Both passwords are required");
    if (password !== confirmPassword)
      throw new BadRequestError("Passwords do not match");

    const user = await this.userRepo.findByResetToken(token);
    if (!user) throw new BadRequestError("Invalid or expired token");
    const hashed = await this.auth.hashPassword(password);

    user.setPassword(hashed);
    user.clearResetToken();
    await this.userRepo.update(user);

    return {
      message: "Password reset successfully",
      role: user.isAdmin ? "admin" : "user",
    };
  }
}
