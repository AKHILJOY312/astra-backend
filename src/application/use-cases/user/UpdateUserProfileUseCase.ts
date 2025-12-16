import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";

interface UpdateProfileDTO {
  name?: string;
  email?: string;
}

@injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository
  ) {}

  async execute(userId: string, dto: UpdateProfileDTO) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    if (dto.name) {
      (user as any)._props.name = dto.name;
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing) throw new Error("Email already in use");

      (user as any)._props.email = dto.email;
      (user as any)._props.isVerified = false;
    }

    await this.userRepo.save(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };
  }
}
