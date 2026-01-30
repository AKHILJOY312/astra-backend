import { inject, injectable } from "inversify";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { TYPES } from "@/config/di/types";
import { NotFoundError } from "@/application/error/AppError";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";
import { GetMeResponseDTO } from "@/application/dto/auth/authDtos";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";

@injectable()
export class GetMe implements IGetMe {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.FileUploadService) private _fileUploadSvc: IFileUploadService,
  ) {}

  async execute(userId: string): Promise<GetMeResponseDTO> {
    const user = await this._userRepo.findById(userId);

    if (!user) throw new NotFoundError("User");
    let profileImageUrl = undefined;
    if (user.ImageUrl) {
      profileImageUrl = await this._fileUploadSvc.generateProfileImageViewUrl(
        user.ImageUrl,
      );
    }
    return {
      user: {
        id: user.id!,
        name: user.name,
        email: user.email,
        avatarUrl: profileImageUrl,
        isAdmin: user.isAdmin,
      },
    };
  }
}
