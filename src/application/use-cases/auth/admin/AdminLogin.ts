// src/application/use-cases/admin/AdminLogin.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../../ports/repositories/IUserRepository";
import { IAuthService } from "../../../ports/services/IAuthService";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from "@/application/error/AppError";
import { IAdminLogin } from "@/application/ports/use-cases/auth/admin/IAdminLoginUseCase";

@injectable()
export class AdminLogin implements IAdminLogin {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestError("Invalid credentials");

    if (!user.isAdmin) {
      throw new UnauthorizedError("Access denied. Admins only.");
    }

    const isValid = await this.authService.comparePassword(
      password,
      user.password
    );
    if (!isValid) throw new ValidationError("Invalid credentials");

    const accessToken = this.authService.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!
    );

    return {
      accessToken,
      user: {
        id: user.id!,
        email: user.email,
        name: user.name,
        isAdmin: true,
      },
    };
  }
}
