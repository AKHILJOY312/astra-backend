// src/core/use-cases/project/AddMemberToProjectUseCase.ts
import { inject, injectable } from "inversify";

import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";
import { NotFoundError, UnauthorizedError } from "@/application/error/AppError";
import {
  ChangeMemberRoleDTO,
  ChangeMemberRoleResultDTO,
  IChangeMemberRoleUseCase,
} from "@/application/ports/use-cases/project/IChangeMemberRoleUseCase";

@injectable()
export class ChangeMemberRoleUseCase implements IChangeMemberRoleUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(
    input: ChangeMemberRoleDTO
  ): Promise<ChangeMemberRoleResultDTO> {
    const { projectId, memberId, newRole, requestedBy } = input;
    console.log(input);
    // 1. Requester must be manager
    const requester = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requester || requester.role !== "manager") {
      throw new UnauthorizedError(
        "Only project managers can change member roles"
      );
    }

    // 2. Target must be a member
    const target = await this.membershipRepo.findById(memberId);
    if (!target) {
      throw new NotFoundError("Member");
    }

    // 3. Prevent removing last manager
    if (target.role === "manager" && newRole !== "manager") {
      const managerCount = await this.membershipRepo.countManagersInProject(
        projectId
      );
      if (managerCount <= 1) {
        throw new UnauthorizedError(
          "Cannot demote the last manager — transfer ownership first"
        );
      }
    }

    // 4. Update role
    target.changeRole(newRole);
    await this.membershipRepo.update(target);

    return { membership: target };
  }
}
