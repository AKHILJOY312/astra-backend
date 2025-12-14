import { inject, injectable } from "inversify";
import { User } from "../../../domain/entities/user/User";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import crypto from "crypto";
import { TYPES } from "@/config/types";

@injectable()
export class GoogleLogin {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  async execute(profile: any): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const email = profile.emails?.[0]?.value;
    const name = profile.displayName || email?.split("@")[0];

    if (!email) throw new Error("No email from Google");

    let user = await this.userRepo.findByEmail(email);

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
      const randomHash = await this.authService.hashPassword(
        crypto.randomUUID()
      );
      newUser.setPassword(randomHash);

      user = await this.userRepo.create(newUser);
    }

    const accessToken = this.authService.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!
    );
    const refreshToken = this.authService.generateRefreshToken(user.id!);

    return { user, accessToken, refreshToken };
  }
}
