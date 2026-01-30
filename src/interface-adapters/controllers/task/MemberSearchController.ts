import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { ValidationError } from "@/application/error/AppError";
import { SearchMembersSchema } from "@/interface-adapters/http/validators/taskValidators";
import { ISearchProjectMembersUseCase } from "@/application/ports/use-cases/task/interfaces";

@injectable()
export class MemberSearchController {
  constructor(
    @inject(TYPES.SearchProjectMembersUseCase)
    private _searchMembersUC: ISearchProjectMembersUseCase,
  ) {}

  // GET /projects/:projectId/tasks/members/search
  searchMembers = async (req: Request, res: Response) => {
    const parsed = SearchMembersSchema.safeParse(req.query);
    if (!parsed.success) {
      throw new ValidationError("Invalid search query");
    }

    const { projectId } = req.params;
    const managerId = req.user!.id;

    const members = await this._searchMembersUC.execute(
      {
        projectId,

        query: parsed.data.query,
      },
      managerId,
    );

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: members,
    });
  };
}
