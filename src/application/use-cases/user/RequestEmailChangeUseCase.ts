import {
  ConflictError,
  NotFoundError,
  TooManyRequestError,
} from "@/application/error/AppError";
import { IEmailChangeOtpRepository } from "@/application/ports/repositories/IEmailChangeOtpRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IRequestEmailChangeUseCase } from "@/application/ports/use-cases/user/IRequestEmailChangeUseCase";
import { TYPES } from "@/config/di/types";
import { EmailChangeOtp } from "@/domain/entities/auth/EmailChangeOtp";
import { inject, injectable } from "inversify";

@injectable()
export class RequestEmailChangeUseCase implements IRequestEmailChangeUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.EmailChangeOtpRepository)
    private otpRepo: IEmailChangeOtpRepository,
    @inject(TYPES.AuthService) private auth: IAuthService,
    @inject(TYPES.EmailService) private emailService: IEmailService,
  ) {}
  async execute(userId: string, newEmail: string) {
    //Validate email done by the controller
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User");
    const existing = await this.userRepo.findByEmail(newEmail);
    if (existing && existing.id !== userId) {
      throw new ConflictError("Email already in use");
    }

    //Rate limiting: max 3 Request per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.otpRepo.countRecentByUserId(userId, oneHourAgo);

    if (recent >= 3) {
      throw new TooManyRequestError("Too many Request. Try again in 1 hour.");
    }
    const otp = this.auth.generateOtp(6);
    const otpHash = await this.auth.hashPassword(otp.toString());

    const emailChangeOtp = new EmailChangeOtp({
      userId,
      newEmail: newEmail.toLowerCase().trim(),
      otpHash: otpHash,
      attempts: 0,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await this.otpRepo.upsert(emailChangeOtp);
    //Send Otp
    await this.emailService.sendEmailChangeOtp(newEmail, otp.toString());
    return { message: "Otp send Successfully" };
  }
}
