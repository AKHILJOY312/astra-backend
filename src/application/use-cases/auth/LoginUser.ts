import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { TYPES } from "@/config/types";

@injectable()
export class LoginUser {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private auth: IAuthService
  ) {}

  async execute(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; name: string; email: string };
  }> {
    if (!email || !password) throw new Error("Email and password are required");

    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    if (!user.isVerified)
      throw new Error("Please verify your email before logging in");
    if (user.isBlocked)
      throw new Error(
        "Sorry you have been blocked by the admin, contact the admin"
      );

    const ok = await this.auth.comparePassword(password, user.password);
    if (!ok) throw new Error("Invalid email or password");

    const access = this.auth.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!
    );
    const refresh = this.auth.generateRefreshToken(user.id!);

    return {
      accessToken: access,
      refreshToken: refresh,
      user: { id: user.id!, name: user.name, email: user.email },
    };
  }
}
