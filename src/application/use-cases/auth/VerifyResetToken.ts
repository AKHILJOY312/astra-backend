import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";
import { IVerifyResetToken } from "@/application/ports/use-cases/auth/IVerifyResetTokenUseCase";

@injectable()
export class VerifyResetToken implements IVerifyResetToken {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(token: string): Promise<{ valid: boolean; message?: string }> {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) throw new BadRequestError("Invalid or expired reset token");

    return { valid: true, message: "Reset token verified" };
  }
}
