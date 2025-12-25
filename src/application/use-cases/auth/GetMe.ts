import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";
import { NotFoundError } from "@/application/error/AppError";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";

@injectable()
export class GetMe implements IGetMe {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(userId: string): Promise<{
    user: { id: string; name: string; email: string; isAdmin: boolean };
  }> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User");

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }
}
