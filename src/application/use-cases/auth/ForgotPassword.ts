import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IEmailService } from "../../ports/services/IEmailService";
import crypto from "crypto";
import { TYPES } from "@/config/di/types";
import { ENV } from "@/config/env.config";
import { IForgotPassword } from "@/application/ports/use-cases/auth/IForgotPasswordUseCase";

@injectable()
export class ForgotPassword implements IForgotPassword {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.EmailService) private _emailSvc: IEmailService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this._userRepo.findByEmail(email);

    // Security: always return the same message
    if (!user) {
      return { message: "If the email exists, a reset link was sent" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000); // 1h

    user.setResetToken(token, expires);
    await this._userRepo.update(user);

    const resetUrl = `${ENV.CLIENT_URL}/verify-email?token=${token}&type=reset`;
    await this._emailSvc.sendPasswordReset(email, token, resetUrl);
    console.log("resetUrl: ", resetUrl);
    return { message: "Password reset link sent to your email" };
  }
}
