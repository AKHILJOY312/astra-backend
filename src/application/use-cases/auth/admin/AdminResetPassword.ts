// src/application/use-cases/admin/AdminResetPassword.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../ports/repositories/IUserRepository";
import { IAuthService } from "../../../ports/services/IAuthService";
import { TYPES } from "@/config/types";

@injectable()
export class AdminResetPassword {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  async execute(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const user = await this.userRepo.findByResetToken(token);
    if (!user || !user.isAdmin) {
      throw new Error("Invalid or expired token");
    }

    const hashed = await this.authService.hashPassword(password);
    user.setPassword(hashed);
    user.clearResetToken();
    await this.userRepo.save(user);

    return { message: "Admin password reset successfully" };
  }
}
