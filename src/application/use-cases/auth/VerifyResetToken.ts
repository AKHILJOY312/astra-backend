import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/di/types";
import { BadRequestError } from "@/application/error/AppError";
import { IVerifyResetToken } from "@/application/ports/use-cases/auth/IVerifyResetTokenUseCase";

@injectable()
export class VerifyResetToken implements IVerifyResetToken {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(token: string): Promise<{ valid: boolean; message?: string }> {
    const user = await this._userRepo.findByResetToken(token);
    if (!user) throw new BadRequestError("Invalid or expired reset token");

    return { valid: true, message: "Reset token verified" };
  }
}
