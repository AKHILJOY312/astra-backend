// src/presentation/controllers/AdminUserController.ts
import { Request, Response } from "express";
import { ListUsersUseCase } from "../../../application/use-cases/user/ListUserUseCase";
import { BlockUserUseCase } from "../../../application/use-cases/user/BlockUserUseCase";
import { AssignAdminRoleUseCase } from "../../../application/use-cases/user/AssingAdminRoleUseCase";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { ListUsersQuerySchema } from "@/interface-adapters/http/validators/adminUserValidators";

@injectable()
export class AdminUserController {
  constructor(
    @inject(TYPES.ListUsersUseCase) private listUsersUseCase: ListUsersUseCase,
    @inject(TYPES.BlockUserUseCase) private blockUserUseCase: BlockUserUseCase,
    @inject(TYPES.AssignAdminRoleUseCase)
    private assignAdminRoleUseCase: AssignAdminRoleUseCase
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
