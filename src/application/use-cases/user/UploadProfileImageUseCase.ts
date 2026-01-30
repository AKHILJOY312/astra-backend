import { injectable, inject } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import {
  IUploadProfileImageUseCase,
  GeneratePresignedUrlDTO,
  // GeneratePresignedUrlResponse,
  SaveProfileImageDTO,
} from "@/application/ports/use-cases/user/IUploadProfileImageUseCase";
import { NotFoundError } from "@/application/error/AppError";

import { IFileUploadService } from "@/application/ports/services/IFileUploadService";

@injectable()
export class UploadProfileImageUseCase implements IUploadProfileImageUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private _userRepo: IUserRepository,

    @inject(TYPES.FileUploadService)
    private _fileUploadSvc: IFileUploadService,
  ) {}

  async generatePresignedUrl(dto: GeneratePresignedUrlDTO) {
    const user = await this._userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError("User");

    return this._fileUploadSvc.generateProfileImageUpload(
      dto.userId,
      dto.fileType,
    );
  }

  async saveImageUrl(dto: SaveProfileImageDTO) {
    const user = await this._userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError("User");

    user.setImageUrl(dto.fileKey); // store key only
    await this._userRepo.update(user);
    return this._fileUploadSvc.generateProfileImageViewUrl(dto.fileKey);
  }
}
