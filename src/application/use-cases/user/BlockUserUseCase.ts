// src/application/usecases/BlockUserUseCase.ts
import { IUserRepository } from "../../repositories/IUserRepository";
import { IAuthService } from "../../services/IAuthService"; // Assuming an AuthService exists

export class BlockUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private authService: IAuthService // For invalidating JWT/session
  ) {}

  async execute(userId: string, newStatus: "active" | "blocked") {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new Error("User not found");

    const isBlocked = newStatus === "blocked";

    // 1. Flip status on the User entity
    user.setBlockStatus(isBlocked);

    // 2. Persist the change
    await this.userRepo.save(user); // Use existing save/updateStatus (if created)

    // 3. Invalidate JWT/session immediately
    if (isBlocked) {
      // Logic to forcibly log out the user across all sessions
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
