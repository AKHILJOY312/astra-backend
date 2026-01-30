import { inject, injectable } from "inversify";
import { User } from "../../../domain/entities/user/User";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import crypto from "crypto";
import { TYPES } from "@/config/di/types";
import { NotFoundError } from "@/application/error/AppError";
import { IGoogleLogin } from "@/application/ports/use-cases/auth/IGoogleLoginUseCase";
import {
  GoogleLoginResponseDTO,
  GoogleProfile,
} from "@/application/dto/auth/authDtos";

@injectable()
export class GoogleLogin implements IGoogleLogin {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authService: IAuthService,
  ) {}

  async execute(profile: GoogleProfile): Promise<GoogleLoginResponseDTO> {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || email?.split("@")[0];

    if (!email) throw new NotFoundError("Email");

    let user = await this._userRepo.findByEmail(email);

    if (!user) {
      // Create new Google user
      const stamp = crypto.randomBytes(32).toString("hex");
      const newUser = new User({
        name: name!,
        email,
        password: "",
        isBlocked: false,
        isAdmin: false,
        isVerified: true,
        securityStamp: stamp,
      });

      // Set random password hash (so login works)
      const randomHash = await this._authService.hashPassword(
        crypto.randomUUID(),
      );
      newUser.setPassword(randomHash);

      user = await this._userRepo.create(newUser);
    }

    const accessToken = this._authService.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!,
    );
    const refreshToken = this._authService.generateRefreshToken(user.id!);

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        imageUrl: user.ImageUrl,
      },
      accessToken,
      refreshToken,
    };
  }
}
