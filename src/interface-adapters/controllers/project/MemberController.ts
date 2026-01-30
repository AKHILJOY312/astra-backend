// src/interfaces/http/controllers/project/MemberController.ts
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
// import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { ValidationError } from "@/application/error/AppError";
import {
  AcceptInvitationSchema,
  AddMemberSchema,
  ChangeRoleSchema,
} from "@/interface-adapters/http/validators/memberValidators";
import { IInviteMemberToProjectUseCase } from "@/application/ports/use-cases/project/IInviteMemberToProjectUseCase";
import { IRemoveMemberFromProjectUseCase } from "@/application/ports/use-cases/project/IRemoveMemberFromProjectUseCase";
import { IChangeMemberRoleUseCase } from "@/application/ports/use-cases/project/IChangeMemberRoleUseCase";
import { IListProjectMembersUseCase } from "@/application/ports/use-cases/project/IListProjectMembersUseCase";
import { ProjectMembership } from "@/domain/entities/project/ProjectMembership";
import { IAcceptInvitationUseCase } from "@/application/ports/use-cases/project/IAcceptInvitationUseCase";

type InviteResult =
  | { type: "added"; membership: ProjectMembership /* adjust to your DTO */ }
  | { type: "invited"; invitationId: string; email: string };

@injectable()
export class MemberController {
  constructor(
    @inject(TYPES.InviteMemberToProjectUseCase)
    private _addMemberUC: IInviteMemberToProjectUseCase,
    @inject(TYPES.RemoveMemberFromProjectUseCase)
    private _removeMemberUC: IRemoveMemberFromProjectUseCase,
    @inject(TYPES.ChangeMemberRoleUseCase)
    private _changeRoleUC: IChangeMemberRoleUseCase,
    @inject(TYPES.ListProjectMembers)
    private _listProjectMembersUC: IListProjectMembersUseCase,
    @inject(TYPES.AcceptInvitationUseCase)
    private _acceptInvitationUC: IAcceptInvitationUseCase,
  ) {}

  // POST /projects/:projectId/members
  addMember = async (req: Request, res: Response) => {
    const parseResult = AddMemberSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new ValidationError("Input member data");
    }

    const { newMemberEmail, role } = parseResult.data;
    const projectId = req.params.projectId;
    const requestedBy = req.user!.id;

    const result: InviteResult = await this._addMemberUC.execute({
      projectId,
      newMemberEmail,
      role,
      requestedBy,
    });
    // Handle the two possible outcomes
    if (result.type === "added") {
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Member added successfully",
        data: {
          type: "membership",
          membership: result.membership.toJSON(),
        },
      });
    }

    // else: invited
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        type: "invitation",
        invitationId: result.invitationId,
        email: result.email,
      },
    });
  };
  acceptInvitation = async (req: Request, res: Response) => {
    // Validate request body
    const parseResult = AcceptInvitationSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid invitation token");
    }

    const { token } = parseResult.data;
    const currentUserId = req.user!.id; // From your auth middleware

    // Execute the use case
    await this._acceptInvitationUC.execute({
      token,
      currentUserId,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message:
        "Invitation accepted successfully. You are now a member of the project.",
    });
  };
  listMembers = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const requestedBy = req.user!.id;

    const members = await this._listProjectMembersUC.execute({
      projectId,
      requestedBy,
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: members,
    });
  };

  // DELETE /projects/:projectId/members/:memberId
  removeMember = async (req: Request, res: Response) => {
    const { projectId, memberId } = req.params;
    const requestedBy = req.user!.id;

    await this._removeMemberUC.execute({
      projectId,
      memberId,
      requestedBy,
    });
    return res.json({ success: true, message: "Member removed" });
  };

  // PATCH /projects/:projectId/members/:memberId/role
  changeRole = async (req: Request, res: Response) => {
    const parseResult = ChangeRoleSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new ValidationError("Invalid role");
    }

    const { role } = parseResult.data;
    const { projectId, memberId } = req.params;
    const requestedBy = req.user!.id;

    const { membership } = await this._changeRoleUC.execute({
      projectId,
      memberId,
      newRole: role,
      requestedBy,
    });

    return res.json({
      success: true,
      data: membership.toJSON(),
    });
  };
}
