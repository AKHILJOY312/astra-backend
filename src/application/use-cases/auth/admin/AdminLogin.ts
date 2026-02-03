// src/application/use-cases/admin/AdminLogin.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../ports/repositories/IUserRepository";
import { IAuthService } from "../../../ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from "@/application/error/AppError";
import { IAdminLogin } from "@/application/ports/use-cases/auth/admin/IAdminLoginUseCase";
import { AdminLoginResponseDTO } from "@/application/dto/auth/authDtos";

@injectable()
export class AdminLogin implements IAdminLogin {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<AdminLoginResponseDTO> {
    const user = await this._userRepo.findByEmail(email);
    if (!user) throw new BadRequestError("Invalid credentials");

    if (!user.isAdmin) {
      throw new UnauthorizedError("Access denied. Admins only.");
    }

    const isValid = await this._authSvc.comparePassword(
      password,
      user.password,
    );
    if (!isValid) throw new ValidationError("Invalid credentials");

    const accessToken = this._authSvc.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!,
    );
    const refresh = this._authSvc.generateRefreshToken(user.id!);
    return {
      accessToken,
      refreshToken: refresh,
      user: {
        id: user.id!,
        email: user.email,
        name: user.name,
        isAdmin: true,
      },
    };
  }
}
