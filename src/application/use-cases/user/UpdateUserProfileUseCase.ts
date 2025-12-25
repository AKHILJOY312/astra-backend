import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { NotFoundError } from "@/application/error/AppError";
import {
  IUpdateUserProfileUseCase,
  UpdateProfileDTO,
} from "@/application/ports/use-cases/user/IUpdateUserProfileUseCase";

@injectable()
export class UpdateUserProfileUseCase implements IUpdateUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository
  ) {}

  async execute(userId: string, dto: UpdateProfileDTO) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    if (dto.name) user.setName(dto.name);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findByEmail(dto.email);
      if (existing) throw new Error("Email already in use");

      user.setEmail(dto.email);
      // (user as any)._props.isVerified = true;
    }

    await this.userRepo.update(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    };
  }
}
