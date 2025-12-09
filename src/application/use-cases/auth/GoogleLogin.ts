import { User } from "../../../domain/entities/user/User";
import { IUserRepository } from "../../repositories/IUserRepository";
import { IAuthService } from "../../services/IAuthService";
import crypto from "crypto";

export class GoogleLogin {
  constructor(
    private userRepo: IUserRepository,
    private authService: IAuthService
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
      const newUser = new User({
        name: name!,
        email,
        password: "",
        isBlocked: false,
        isAdmin: false,
        isVerified: true,
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
      user.email
    );
    const refreshToken = this.authService.generateRefreshToken(user.id!);

    return { user, accessToken, refreshToken };
  }
}
