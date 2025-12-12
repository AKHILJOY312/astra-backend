import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";

@injectable()
export class VerifyEmail {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByVerificationToken(token);
    if (!user) throw new Error("Invalid or expired token");

    user.verify();
    user.clearVerificationToken();
    await this.userRepo.save(user);

    return { message: "Email verified successfully. You can now log in." };
  }
}
