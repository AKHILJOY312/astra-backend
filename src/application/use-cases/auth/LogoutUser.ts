// src/application/use-cases/auth/LogoutUser.ts
import { inject, injectable } from "inversify";
import { ITokenBlacklistService } from "../../ports/services/ITokenBlacklistService";
import { TYPES } from "@/config/types";
import { ILogoutUser } from "@/application/ports/use-cases/auth/ILogoutUserUseCase";

@injectable()
export class LogoutUser implements ILogoutUser {
  constructor(
    @inject(TYPES.TokenBlacklistService)
    private readonly blacklistService: ITokenBlacklistService
  ) {}

  async execute(
    refreshToken: string,
    expiresAt: Date
  ): Promise<{ message: string }> {
    if (!refreshToken) {
      return { message: "No active session" };
    }

    await this.blacklistService.addToBlacklist(refreshToken, expiresAt);

    return { message: "Logged out successfully" };
  }
}
