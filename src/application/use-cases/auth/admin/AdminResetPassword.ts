// src/application/use-cases/admin/AdminResetPassword.ts
import { IUserRepository } from "../../../repositories/IUserRepository";
import { IAuthService } from "../../../services/IAuthService";

export class AdminResetPassword {
  constructor(
    private userRepo: IUserRepository,
    private authService: IAuthService
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
