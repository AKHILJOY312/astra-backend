import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { TYPES } from "@/config/types";

@injectable()
export class RefreshToken {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private auth: IAuthService
  ) {}

  async execute(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = this.auth.verifyRefreshToken(refreshToken);
    if (!payload) throw new Error("Invalid refresh token");

    const user = await this.userRepo.findById(payload.id);
    if (!user) throw new Error("Invalid refresh token");
    if (user.isBlocked) {
      throw new Error("Sorry you have been blocked by the admin.");
    }
    console.log("user in refrsh token : ", user);
    const accessToken = this.auth.generateAccessToken(
      user.id!,
      user.email,
      user.securityStamp!
    );
    return { accessToken };
  }
}
