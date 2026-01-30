import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/di/types";
import { BadRequestError } from "@/application/error/AppError";
import { IVerifyEmail } from "@/application/ports/use-cases/auth/IVerifyEmailUseCase";

@injectable()
export class VerifyEmail implements IVerifyEmail {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const user = await this._userRepo.findByVerificationToken(token);
    if (!user) throw new BadRequestError("Invalid or expired token");

    user.verify();
    user.clearVerificationToken();
    await this._userRepo.update(user);

    return { message: "Email verified successfully. You can now log in." };
  }
}
