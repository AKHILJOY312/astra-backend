// src/application/use-cases/admin/AdminForgotPassword.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../ports/repositories/IUserRepository";
import { IEmailService } from "../../../ports/services/IEmailService";
import crypto from "crypto";
import { TYPES } from "@/config/di/types";
import { IAdminForgotPassword } from "@/application/ports/use-cases/auth/admin/IAdminForgotPasswordUseCase";

@injectable()
export class AdminForgotPassword implements IAdminForgotPassword {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
  ) {}

  async execute(email: string) {
    const user = await this._userRepo.findByEmail(email);
    if (!user || !user.isAdmin) {
      // Security: always respond the same
      return {
        message: "If an admin exists with that email, a reset link was sent.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.setResetToken(token, expires);
    await this._userRepo.update(user);

    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}`;
    await this._emailService.sendPasswordReset(user.email, token, resetUrl);

    return {
      message: "If an admin exists with that email, a reset link was sent.",
    };
  }
}
