import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
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
    private _userRepo: IUserRepository,
  ) {}

  async execute(userId: string, dto: UpdateProfileDTO) {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    if (dto.name) user.setName(dto.name);
    if (dto.about) user.setAbout(dto.about);
    if (dto.phone) user.setPhone(dto.phone);
    if (dto.link) user.setLink(dto.link);

    await this._userRepo.update(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      about: user.about,
      phone: user.phone,
      link: user.link,
      isVerified: user.isVerified,
    };
  }
}
