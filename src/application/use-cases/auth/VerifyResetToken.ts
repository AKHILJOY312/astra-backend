import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";

@injectable()
export class VerifyResetToken {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(token: string): Promise<{ valid: boolean; message?: string }> {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) throw new Error("Invalid or expired reset token");

    return { valid: true, message: "Reset token verified" };
  }
}
