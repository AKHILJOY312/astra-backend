// src/presentation/controllers/AdminUserController.ts
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { BadRequestError } from "@/application/error/AppError";
import { ListUsersQuerySchema } from "@/interface-adapters/http/validators/adminUserValidators";
import { IListUsersUseCase } from "@/application/ports/use-cases/user/IListUsersUseCase";
import { IBlockUserUseCase } from "@/application/ports/use-cases/user/IBlockUserUseCase";
import { IAssignAdminRoleUseCase } from "@/application/ports/use-cases/user/IAssignAdminRoleUseCase";

@injectable()
export class AdminUserController {
  constructor(
    @inject(TYPES.ListUsersUseCase) private _listUsersUC: IListUsersUseCase,
    @inject(TYPES.BlockUserUseCase) private _blockUserUC: IBlockUserUseCase,
    @inject(TYPES.AssignAdminRoleUseCase)
    private _assignAdminRoleUC: IAssignAdminRoleUseCase,
  ) {}

  listUsers = async (req: Request, res: Response): Promise<void> => {
    const parsed = ListUsersQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw new BadRequestError("Invalid pagination or search parameters");
    }

    const { page, limit, search } = parsed.data;
    const result = await this._listUsersUC.execute({
      page,
      limit,
      search,
    });
    res.json(result);
  };

  blockUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this._blockUserUC.execute(id);
    res.json({ message: `User status updated `, user });
  };

  updateRole = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this._assignAdminRoleUC.execute(id);
    res.json({ message: `User role updated`, user });
  };
}
