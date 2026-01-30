import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
import { LoginUserResponseDTO } from "@/application/dto/auth/authDtos";

@injectable()
export class LoginUser implements ILoginUser {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<LoginUserResponseDTO> {
    if (!email || !password)
      throw new BadRequestError("Email and password are required");

    const user = await this._userRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError("Invalid email or password");

    if (!user.isVerified)
      throw new ForbiddenError("Please verify your email before logging in");
    if (user.isBlocked)
      throw new ForbiddenError(
        "Sorry you have been blocked by the admin, contact the admin",
      );

    const ok = await this._authSvc.comparePassword(password, user.password);
    if (!ok) throw new UnauthorizedError("Invalid email or password");

    const access = this._authSvc.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!,
    );
    const refresh = this._authSvc.generateRefreshToken(user.id!);

    return {
      accessToken: access,
      refreshToken: refresh,
      user: { id: user.id!, name: user.name, email: user.email },
    };
  }
}
