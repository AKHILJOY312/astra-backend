import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IEmailChangeOtpRepository } from "@/application/ports/repositories/IEmailChangeOtpRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IVerifyEmailChangeUseCase } from "@/application/ports/use-cases/user/IVerifyEmailChangeUseCase";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";

injectable();
export class VerifyEmailChangeUseCase implements IVerifyEmailChangeUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.EmailChangeOtpRepository)
    private _otpRepo: IEmailChangeOtpRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
  ) {}

  async execute(userId: string, otp: string) {
    const record = await this._otpRepo.findByUserId(userId);
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired OTP");
    }

    if (record.attempts >= 5) {
      await this._otpRepo.deleteByUserId(userId);
      throw new UnauthorizedError("Too many failed attempts");
    }

    const isValid = await this._authSvc.comparePassword(otp, record.otpHash);
    if (!isValid) {
      await this._otpRepo.incrementAttempts(userId);
      throw new UnauthorizedError("Invalid OTP");
    }

    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    user.setEmail(record.newEmail);
    //user.verify();

    await this._userRepo.update(user);

    await this._authSvc.invalidateUserSessions(userId);
    await this._otpRepo.deleteByUserId(userId);

    return { message: "Email changed successfully", newEmail: record.newEmail };
  }
}
