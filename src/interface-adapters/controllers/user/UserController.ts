import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

import { IGetUserProfileUseCase } from "@/application/ports/use-cases/user/IGetUserProfileUseCase";
import { IUpdateUserProfileUseCase } from "@/application/ports/use-cases/user/IUpdateUserProfileUseCase";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";
import { IUploadProfileImageUseCase } from "@/application/ports/use-cases/user/IUploadProfileImageUseCase";
import { BadRequestError } from "@/application/error/AppError";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.GetUserProfileUseCase)
    private getProfileUC: IGetUserProfileUseCase,
    @inject(TYPES.UpdateUserProfileUseCase)
    private updateProfileUC: IUpdateUserProfileUseCase,
    @inject(TYPES.DeleteUserAccountUseCase)
    private deleteAccountUC: IDeleteUserAccountUseCase,
    @inject(TYPES.UploadProfileImageUseCase)
    private uploadProfileImageUC: IUploadProfileImageUseCase
  ) {}

  getProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = await this.getProfileUC.execute(userId);
    res.status(200).json(data);
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, email } = req.body;

    const updated = await this.updateProfileUC.execute(userId, {
      name,
      email,
    });

    res.status(200).json(updated);
  };

  deleteAccount = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await this.deleteAccountUC.execute(userId);
    res.status(204).send();
  };
  // === NEW: Presigned URL for direct S3 upload ===
  getPresignedUrl = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { fileType } = req.body;

    if (!fileType || !fileType.startsWith("image/")) {
      throw new BadRequestError("Invalid or missing fileType");
    }

    const { uploadUrl, fileKey } =
      await this.uploadProfileImageUC.generatePresignedUrl({
        userId,
        fileType,
      });

    return res.json({ uploadUrl, fileKey });
  };

  // === NEW: Save the final image URL to user profile ===
  saveProfileImage = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { fileKey } = req.body;

    if (!fileKey || typeof fileKey !== "string") {
      return res.status(400).json({ message: "imageUrl is required" });
    }

    const imageUrl = await this.uploadProfileImageUC.saveImageUrl({
      userId,
      fileKey,
    });

    // Optionally refetch full profile or just return the URL
    return res.json({
      message: "Profile image updated successfully",
      imageUrl,
    });
  };
}
