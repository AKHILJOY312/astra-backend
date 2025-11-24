// src/interfaces/http/controllers/project/MemberController.ts
import { Request, Response } from "express";
import { AddMemberToProjectUseCase } from "../../../application/use-cases/project/AddMemberToProjectUseCase";
import { RemoveMemberFromProjectUseCase } from "../../../application/use-cases/project/RemoveMemberFromProjectUseCase";
import { ChangeMemberRoleUseCase } from "../../../application/use-cases/project/ChangeMemberRoleUseCase";
import { z } from "zod";

export class MemberController {
  constructor(
    private addMemberUseCase: AddMemberToProjectUseCase,
    private removeMemberUseCase: RemoveMemberFromProjectUseCase,
    private changeRoleUseCase: ChangeMemberRoleUseCase
  ) {}

  // POST /projects/:projectId/members
  async addMember(req: Request, res: Response) {
    const schema = z.object({
      userEmail: z.string().email(),
      role: z.enum(["member", "lead", "manager"]).optional().default("member"),
    });

    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.format() });
    }

    const { userEmail, role } = parseResult.data;
    const projectId = req.params.projectId;
    const requestedBy = req.user!.id;

    // Resolve userId from email (you probably have a UserService)
    const userId = await this.findUserIdByEmail(userEmail);
    if (!userId) return res.status(404).json({ error: "User not found" });

    try {
      const { membership } = await this.addMemberUseCase.execute({
        projectId,
        userId,
        role,
        requestedBy,
      });

      return res.status(201).json({
        success: true,
        data: membership.toJSON(),
      });
    } catch (err: any) {
      if (err.message.includes("limit")) {
        return res.status(403).json({
          error: err.message,
          upgradeRequired: true,
        });
      }
      if (err.message.includes("Only project managers")) {
        return res.status(403).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
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
      return res.status(403).json({ error: err.message });
    }
  }

  // PATCH /projects/:projectId/members/:memberId/role
  async changeRole(req: Request, res: Response) {
    const schema = z.object({
      role: z.enum(["member", "lead", "manager"]),
    });

    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.format() });
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
      return res.status(403).json({ error: err.message });
    }
  }

  // Helper – replace with real UserService later
  private async findUserIdByEmail(email: string): Promise<string | null> {
    // Example: const user = await UserModel.findOne({ email });
    // return user?._id.toString() || null;
    return "671d8f1a9c2b3e4f12345678"; // mock
  }
}
