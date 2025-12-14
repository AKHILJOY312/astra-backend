// src/application/usecases/BlockUserUseCase.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService"; // Assuming an AuthService exists
import { TYPES } from "@/config/types";

@injectable()
export class BlockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private authService: IAuthService // For invalidating JWT/session
  ) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new Error("User not found");

    const isBlocked = user.isBlocked;
    // 1. Flip status on the User entity
    user.setBlockStatus(!isBlocked);
    // 2. Persist the change
    await this.userRepo.updateStatus(user.id!); // Use existing save/updateStatus (if created)

    // 3. Invalidate JWT/session immediately
    if (user.isBlocked) {
      await this.authService.invalidateUserSessions(userId);
    }

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      status: user.isBlocked ? "blocked" : "active",
    };
  }
}
