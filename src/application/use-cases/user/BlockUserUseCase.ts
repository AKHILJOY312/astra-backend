// src/application/usecases/BlockUserUseCase.ts
import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService"; // Assuming an AuthService exists
import { TYPES } from "@/config/di/types";
import { NotFoundError } from "@/application/error/AppError";
import {
  BlockUserResponseDTO,
  IBlockUserUseCase,
} from "@/application/ports/use-cases/user/IBlockUserUseCase";

@injectable()
export class BlockUserUseCase implements IBlockUserUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService, // For invalidating JWT/session
  ) {}

  async execute(userId: string): Promise<BlockUserResponseDTO> {
    const user = await this._userRepo.findById(userId);

    if (!user) throw new NotFoundError("User");

    const isBlocked = user.isBlocked;
    // 1. Flip status on the User entity
    user.setBlockStatus(!isBlocked);
    // 2. Persist the change
    await this._userRepo.updateStatus(user.id!); // Use existing save/updateStatus (if created)

    // 3. Invalidate JWT/session immediately
    if (user.isBlocked) {
      await this._authSvc.invalidateUserSessions(userId);
    }

    return {
      id: user.id!,
      name: user.name,
      email: user.email,
      status: user.isBlocked ? "blocked" : "active",
    };
  }
}
