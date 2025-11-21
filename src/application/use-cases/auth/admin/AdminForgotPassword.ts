// src/application/use-cases/admin/AdminForgotPassword.ts
import { IUserRepository } from "../../../repositories/IUserRepository";
import { IEmailService } from "../../../services/IEmailService";
import crypto from "crypto";

export class AdminForgotPassword {
  constructor(
    private userRepo: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(email: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !user.isAdmin) {
      // Security: always respond the same
      return {
        message: "If an admin exists with that email, a reset link was sent.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.setResetToken(token, expires);
    await this.userRepo.save(user);

    const resetUrl = `${process.env.ADMIN_URL}/reset-password?token=${token}`;
    await this.emailService.sendPasswordReset(user.email, token, resetUrl);

    return {
      message: "If an admin exists with that email, a reset link was sent.",
    };
  }
}
