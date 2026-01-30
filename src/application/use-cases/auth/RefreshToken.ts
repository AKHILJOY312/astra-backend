import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";

@injectable()
export class RefreshToken implements IRefreshToken {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
    @inject(TYPES.TokenBlacklistService)
    private _blackListSvc: ITokenBlacklistService,
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this._authSvc.verifyRefreshToken(refreshToken);
    if (!payload)
      throw new BadRequestError("Refresh token is missing or invalid");

    const isBlacklisted = await this._blackListSvc.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedError(
        "Token has been revoked. Please login again.",
      );
    }
    const user = await this._userRepo.findById(payload.id);
    if (!user) throw new UnauthorizedError("Invalid or expired refresh token");
    if (user.isBlocked) {
      throw new ForbiddenError(
        "Your account has been blocked. Please contact support.",
      );
    }

    const accessToken = this._authSvc.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!,
    );
    return { accessToken };
  }
}
