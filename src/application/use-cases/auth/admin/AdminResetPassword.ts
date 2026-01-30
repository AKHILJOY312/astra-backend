// src/application/use-cases/admin/AdminResetPassword.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../ports/repositories/IUserRepository";
import { IAuthService } from "../../../ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import {
  UnauthorizedError,
  ValidationError,
} from "@/application/error/AppError";
import { IAdminResetPassword } from "@/application/ports/use-cases/auth/admin/IAdminResetPasswordUseCase";

@injectable()
export class AdminResetPassword implements IAdminResetPassword {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authService: IAuthService,
  ) {}

  async execute(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new ValidationError("Passwords do not match");
    }

    const user = await this._userRepo.findByResetToken(token);
    if (!user || !user.isAdmin) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    const hashed = await this._authService.hashPassword(password);
    user.setPassword(hashed);
    user.clearResetToken();
    await this._userRepo.update(user);

    return { message: "Admin password reset successfully" };
  }
}
