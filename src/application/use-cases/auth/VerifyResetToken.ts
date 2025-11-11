// src/application/use  // src/application/use-cases/VerifyResetToken.ts
import { IUserRepository } from "../../repositories/IUserRepository";

export class VerifyResetToken {
  constructor(private userRepo: IUserRepository) {}

  async execute(token: string): Promise<{ valid: boolean; message?: string }> {
    const user = await this.userRepo.findByResetToken(token);
    if (!user) throw new Error("Invalid or expired reset token");

    return { valid: true, message: "Reset token verified" };
  }
}
