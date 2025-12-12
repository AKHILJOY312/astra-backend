// src/core/use-cases/project/AddMemberToProjectUseCase.ts
import { inject, injectable } from "inversify";
import {
  ProjectMembership,
  ProjectRole,
} from "../../../domain/entities/project/ProjectMembership";

import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";

export interface ChangeMemberRoleDTO {
  projectId: string;
  memberId: string; // userId to change role
  newRole: ProjectRole;
  requestedBy: string; // who is changing (must be manager)
}

export interface ChangeMemberRoleResultDTO {
  membership: ProjectMembership;
}

@injectable()
export class ChangeMemberRoleUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(
    input: ChangeMemberRoleDTO
  ): Promise<ChangeMemberRoleResultDTO> {
    const { projectId, memberId, newRole, requestedBy } = input;

    // 1. Requester must be manager
    const requester = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requester || requester.role !== "manager") {
      throw new Error("Only project managers can change member roles");
    }

    // 2. Target must be a member
    const target = await this.membershipRepo.findByProjectAndUser(
      projectId,
      memberId
    );
    if (!target) {
      throw new Error("User is not a member of this project");
    }

    // 3. Prevent removing last manager
    if (target.role === "manager" && newRole !== "manager") {
      const managerCount = await this.membershipRepo.countManagersInProject(
        projectId
      );
      if (managerCount <= 1) {
        throw new Error(
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
