import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { IGetUserProfileUseCase } from "@/application/ports/use-cases/user/IGetUserProfileUseCase";
import { IUpdateUserProfileUseCase } from "@/application/ports/use-cases/user/IUpdateUserProfileUseCase";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.GetUserProfileUseCase)
    private getProfileUC: IGetUserProfileUseCase,
    @inject(TYPES.UpdateUserProfileUseCase)
    private updateProfileUC: IUpdateUserProfileUseCase,
    @inject(TYPES.DeleteUserAccountUseCase)
    private deleteAccountUC: IDeleteUserAccountUseCase
  ) {}

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data = await this.getProfileUC.execute(userId);
    res.status(200).json(data);
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, email } = req.body;

    const updated = await this.updateProfileUC.execute(userId, {
      name,
      email,
    });

    res.status(200).json(updated);
  });

  deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await this.deleteAccountUC.execute(userId);
    res.status(204).send();
  });
}
