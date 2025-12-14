import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";

@injectable()
export class GetMe {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(userId: string): Promise<{
    user: { id: string; name: string; email: string; isAdmin: boolean };
  }> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new Error("User not found");

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
