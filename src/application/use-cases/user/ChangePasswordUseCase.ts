// application/use-cases/auth/ChangePasswordUseCase.ts
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from "@/application/error/AppError";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IChangePasswordUseCase } from "@/application/ports/use-cases/user/IChangePasswordUseCase";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class ChangePasswordUseCase implements IChangePasswordUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
  ) {}

  async execute(userId: string, oldPassword: string, newPassword: string) {
    // 1. Fetch user WITH password (note: your current findById selects -password!)
    const user = await this._userRepo.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    // 2. Verify old password
    const isOldPasswordValid = await this._authSvc.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // 3. Optional: prevent setting same password
    const isSameAsOld = await this._authSvc.comparePassword(
      newPassword,
      user.password,
    );
    if (isSameAsOld) {
      throw new BadRequestError(
        "New password must be different from the current one",
      );
    }

    // 4. Hash new password
    const hashedPassword = await this._authSvc.hashPassword(newPassword);

    // 5. Update password + invalidate other sessions (best practice on password change)
    user.setPassword(hashedPassword);
    await this._userRepo.update(user);

    // Invalidate all other sessions by changing security stamp
    await this._authSvc.invalidateUserSessions(userId);

    return { message: "Password updated successfully" };
  }
}
