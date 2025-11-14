// src/application/use-cases/GetMe.ts
import { IUserRepository } from "../../repositories/IUserRepository";

export class GetMe {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string): Promise<{
    user: { id: string; name: string; email: string };
  }> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new Error("User not found");

    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
      },
    };
  }
}
