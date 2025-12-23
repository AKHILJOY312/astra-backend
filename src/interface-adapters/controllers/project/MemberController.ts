// src/interfaces/http/controllers/project/MemberController.ts
import { Request, Response } from "express";
import { AddMemberToProjectUseCase } from "../../../application/use-cases/project/AddMemberToProjectUseCase";
import { RemoveMemberFromProjectUseCase } from "../../../application/use-cases/project/RemoveMemberFromProjectUseCase";
import { ChangeMemberRoleUseCase } from "../../../application/use-cases/project/ChangeMemberRoleUseCase";
import { UserService } from "../../../application/services/UserService";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
// import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { ListProjectMembersUseCase } from "@/application/use-cases/project/ListProjectMembersUseCase";
import { NotFoundError, ValidationError } from "@/application/error/AppError";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import {
  AddMemberSchema,
  ChangeRoleSchema,
} from "@/interface-adapters/http/validators/memberValidators";

@injectable()
export class MemberController {
  constructor(
    @inject(TYPES.AddMemberToProjectUseCase)
    private addMemberUseCase: AddMemberToProjectUseCase,
    @inject(TYPES.RemoveMemberFromProjectUseCase)
    private removeMemberUseCase: RemoveMemberFromProjectUseCase,
    @inject(TYPES.ChangeMemberRoleUseCase)
    private changeRoleUseCase: ChangeMemberRoleUseCase,
    @inject(TYPES.UserService) private userService: UserService,
    @inject(TYPES.ListProjectMembers)
    private listProjectMembersUC: ListProjectMembersUseCase
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
