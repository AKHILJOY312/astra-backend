import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";

import { IGetUserProfileUseCase } from "@/application/ports/use-cases/user/IGetUserProfileUseCase";
import { IUpdateUserProfileUseCase } from "@/application/ports/use-cases/user/IUpdateUserProfileUseCase";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";
import { IUploadProfileImageUseCase } from "@/application/ports/use-cases/user/IUploadProfileImageUseCase";
import { BadRequestError } from "@/application/error/AppError";
import { IChangePasswordUseCase } from "@/application/ports/use-cases/user/IChangePasswordUseCase";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "@/interface-adapters/http/validators/userValidators";
import { IRequestEmailChangeUseCase } from "@/application/ports/use-cases/user/IRequestEmailChangeUseCase";
import { IVerifyEmailChangeUseCase } from "@/application/ports/use-cases/user/IVerifyEmailChangeUseCase";
import { emailSchema } from "@/interface-adapters/http/validators/baseValidators";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.GetUserProfileUseCase)
    private _getProfileUC: IGetUserProfileUseCase,
    @inject(TYPES.UpdateUserNameUseCase)
    private _updateProfileUC: IUpdateUserProfileUseCase,
    @inject(TYPES.DeleteUserAccountUseCase)
    private _deleteAccountUC: IDeleteUserAccountUseCase,
    @inject(TYPES.UploadProfileImageUseCase)
    private _uploadProfileImageUC: IUploadProfileImageUseCase,
    @inject(TYPES.ChangePasswordUseCase)
    private _changePasswordUC: IChangePasswordUseCase,
    @inject(TYPES.RequestEmailChangeUseCase)
    private _requestOtpUC: IRequestEmailChangeUseCase,
    @inject(TYPES.VerifyEmailChangeUseCase)
    private _verifyEmailUC: IVerifyEmailChangeUseCase,
  ) {}

  getProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = await this._getProfileUC.execute(userId);
    res.status(200).json(data);
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const validatedData = updateProfileSchema.parse(req.body);

    const updated = await this._updateProfileUC.execute(userId, validatedData);

    res.status(200).json(updated);
  };

  deleteAccount = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await this._deleteAccountUC.execute(userId);
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
      await this._uploadProfileImageUC.generatePresignedUrl({
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

    const imageUrl = await this._uploadProfileImageUC.saveImageUrl({
      userId,
      fileKey,
    });

    // Optionally refetch full profile or just return the URL
    return res.json({
      message: "Profile image updated successfully",
      imageUrl,
    });
  };

  changePassword = async (req: Request, res: Response) => {
    //validating the incoming request with Zod schema
    const validatedData = changePasswordSchema.parse(req.body);

    const userId = req.user!.id;

    const result = await this._changePasswordUC.execute(
      userId,
      validatedData.oldPassword,
      validatedData.newPassword,
    );
    return res.json(result);
  };
  requestOtp = async (req: Request, res: Response) => {
    const validatedEmail = await emailSchema.parse(req.body.newEmail);
    const userId = req.user!.id;

    const result = await this._requestOtpUC.execute(userId, validatedEmail);

    return res.json(result);
  };
  verifyOtpAndChangeEmail = async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const emailChangeOtp = req.body.emailChangeOtp;

    const result = await this._verifyEmailUC.execute(userId, emailChangeOtp);
    console.log(result);
    return res.json(result);
  };
}
