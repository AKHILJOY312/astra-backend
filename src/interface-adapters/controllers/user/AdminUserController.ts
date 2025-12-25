// src/presentation/controllers/AdminUserController.ts
import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { ListUsersQuerySchema } from "@/interface-adapters/http/validators/adminUserValidators";
import { IListUsersUseCase } from "@/application/ports/use-cases/user/IListUsersUseCase";
import { IBlockUserUseCase } from "@/application/ports/use-cases/user/IBlockUserUseCase";
import { IAssignAdminRoleUseCase } from "@/application/ports/use-cases/user/IAssignAdminRoleUseCase";

@injectable()
export class AdminUserController {
  constructor(
    @inject(TYPES.ListUsersUseCase) private listUsersUseCase: IListUsersUseCase,
    @inject(TYPES.BlockUserUseCase) private blockUserUseCase: IBlockUserUseCase,
    @inject(TYPES.AssignAdminRoleUseCase)
    private assignAdminRoleUseCase: IAssignAdminRoleUseCase
  ) {}

  listUsers = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const parsed = ListUsersQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new BadRequestError("Invalid pagination or search parameters");
      }

      const { page, limit, search } = parsed.data;
      const result = await this.listUsersUseCase.execute({
        page,
        limit,
        search,
      });
      res.json(result);
    }
  );

  blockUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const user = await this.blockUserUseCase.execute(id);
      res.json({ message: `User status updated `, user });
    }
  );

  updateRole = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const user = await this.assignAdminRoleUseCase.execute(id);
      res.json({ message: `User role updated`, user });
    }
  );
}
