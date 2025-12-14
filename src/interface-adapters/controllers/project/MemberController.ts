// src/interfaces/http/controllers/project/MemberController.ts
import { Request, Response } from "express";
import { AddMemberToProjectUseCase } from "../../../application/use-cases/project/AddMemberToProjectUseCase";
import { RemoveMemberFromProjectUseCase } from "../../../application/use-cases/project/RemoveMemberFromProjectUseCase";
import { ChangeMemberRoleUseCase } from "../../../application/use-cases/project/ChangeMemberRoleUseCase";
import { z } from "zod";
import { UserService } from "../../../application/services/UserService";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { ERROR_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class MemberController {
  constructor(
    @inject(TYPES.AddMemberToProjectUseCase)
    private addMemberUseCase: AddMemberToProjectUseCase,
    @inject(TYPES.RemoveMemberFromProjectUseCase)
    private removeMemberUseCase: RemoveMemberFromProjectUseCase,
    @inject(TYPES.ChangeMemberRoleUseCase)
    private changeRoleUseCase: ChangeMemberRoleUseCase,
    @inject(TYPES.UserService) private userService: UserService
  ) {}

  // POST /projects/:projectId/members
  async addMember(req: Request, res: Response) {
    const schema = z.object({
      userEmail: z.string().email(),
      role: z.enum(["member", "lead", "manager"]).optional().default("member"),
    });

    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: parseResult.error.format() });
    }

    const { userEmail, role } = parseResult.data;
    const projectId = req.params.projectId;
    const requestedBy = req.user!.id;

    const userId = await this.userService.findUserIdByEmail(userEmail);
    if (!userId) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ error: ERROR_MESSAGES.USER_NOT_FOUND });
    }
    try {
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
    } catch (err: any) {
      if (err.message.includes("limit")) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: err.message,
          upgradeRequired: true,
        });
      }
      if (err.message.includes("Only project managers")) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({ error: err.message });
      }
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    }
  }

  // DELETE /projects/:projectId/members/:memberId
  async removeMember(req: Request, res: Response) {
    const { projectId, memberId } = req.params;
    const requestedBy = req.user!.id;

    try {
      await this.removeMemberUseCase.execute({
        projectId,
        memberId,
        requestedBy,
      });
      return res.json({ success: true, message: "Member removed" });
    } catch (err: any) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: err.message });
    }
  }

  // PATCH /projects/:projectId/members/:memberId/role
  async changeRole(req: Request, res: Response) {
    const schema = z.object({
      role: z.enum(["member", "lead", "manager"]),
    });

    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: parseResult.error.format() });
    }

    const { role } = parseResult.data;
    const { projectId, memberId } = req.params;
    const requestedBy = req.user!.id;

    try {
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
    } catch (err: any) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: err.message });
    }
  }
}
