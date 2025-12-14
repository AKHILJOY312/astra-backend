import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IEmailService } from "../../ports/services/IEmailService";
import crypto from "crypto";
import { TYPES } from "@/config/types";

@injectable()
export class ForgotPassword {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.EmailService) private email: IEmailService
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);

    // Security: always return the same message
    if (!user) {
      return { message: "If the email exists, a reset link was sent" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000); // 1h

    user.setResetToken(token, expires);
    await this.userRepo.save(user);

    const resetUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}&type=reset`;
    await this.email.sendPasswordReset(email, token, resetUrl);

    return { message: "Password reset link sent to your email" };
  }
}
