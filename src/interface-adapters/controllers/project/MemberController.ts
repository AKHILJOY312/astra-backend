// src/interfaces/http/controllers/project/MemberController.ts
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
// import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { NotFoundError, ValidationError } from "@/application/error/AppError";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import {
  AddMemberSchema,
  ChangeRoleSchema,
} from "@/interface-adapters/http/validators/memberValidators";
import { IAddMemberToProjectUseCase } from "@/application/ports/use-cases/project/IAddMemberToProjectUseCase";
import { IRemoveMemberFromProjectUseCase } from "@/application/ports/use-cases/project/IRemoveMemberFromProjectUseCase";
import { IChangeMemberRoleUseCase } from "@/application/ports/use-cases/project/IChangeMemberRoleUseCase";
import { IUserService } from "@/application/ports/services/IUserService";
import { IListProjectMembersUseCase } from "@/application/ports/use-cases/project/IListProjectMembersUseCase";

@injectable()
export class MemberController {
  constructor(
    @inject(TYPES.AddMemberToProjectUseCase)
    private addMemberUseCase: IAddMemberToProjectUseCase,
    @inject(TYPES.RemoveMemberFromProjectUseCase)
    private removeMemberUseCase: IRemoveMemberFromProjectUseCase,
    @inject(TYPES.ChangeMemberRoleUseCase)
    private changeRoleUseCase: IChangeMemberRoleUseCase,
    @inject(TYPES.UserService) private userService: IUserService,
    @inject(TYPES.ListProjectMembers)
    private listProjectMembersUC: IListProjectMembersUseCase
  ) {}

  // POST /projects/:projectId/members
  addMember = asyncHandler(async (req: Request, res: Response) => {
    const parseResult = AddMemberSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Input member data");
    }

    const { userEmail, role } = parseResult.data;
    const projectId = req.params.projectId;
    const requestedBy = req.user!.id;

    const userId = await this.userService.findUserIdByEmail(userEmail);
    if (!userId) {
      throw new NotFoundError("User");
    }

    const { membership } = await this.addMemberUseCase.execute({
      projectId,
      userId,
      role,
      requestedBy,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: membership.toJSON(),
    });
  });

  listMembers = asyncHandler(async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const requestedBy = req.user!.id;

    const members = await this.listProjectMembersUC.execute({
      projectId,
      requestedBy,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: members,
    });
  });

  // DELETE /projects/:projectId/members/:memberId
  removeMember = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, memberId } = req.params;
    const requestedBy = req.user!.id;

    await this.removeMemberUseCase.execute({
      projectId,
      memberId,
      requestedBy,
    });
    return res.json({ success: true, message: "Member removed" });
  });

  // PATCH /projects/:projectId/members/:memberId/role
  changeRole = asyncHandler(async (req: Request, res: Response) => {
    const parseResult = ChangeRoleSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid role");
    }

    const { role } = parseResult.data;
    const { projectId, memberId } = req.params;
    const requestedBy = req.user!.id;

    const { membership } = await this.changeRoleUseCase.execute({
      projectId,
      memberId,
      newRole: role,
      requestedBy,
    });

    return res.json({
      success: true,
      data: membership.toJSON(),
    });
  });
}
