// src/core/use-cases/project/RemoveMemberFromProjectUseCase.ts
import { IProjectMembershipRepository } from "../../repositories/IProjectMembershipRepository";

export interface RemoveMemberDTO {
  projectId: string;
  memberId: string; // userId to remove
  requestedBy: string; // who is removing (must be manager)
}

export interface RemoveMemberResultDTO {
  message: string;
}

export class RemoveMemberFromProjectUseCase {
  constructor(private membershipRepo: IProjectMembershipRepository) {}

  async execute(input: RemoveMemberDTO): Promise<RemoveMemberResultDTO> {
    const { projectId, memberId, requestedBy } = input;

    // 1. Requester must be manager
    const requester = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requester || requester.role !== "manager") {
      throw new Error("Only project managers can remove members");
    }

    // 2. Cannot remove self if you're the only manager
    if (memberId === requestedBy) {
      const managerCount = await this.membershipRepo.countManagersInProject(
        projectId
      );
      if (managerCount <= 1) {
        throw new Error(
          "You cannot remove yourself — there must be at least one manager left"
        );
      }
    }

    // 3. Target must actually be a member
    const target = await this.membershipRepo.findByProjectAndUser(
      projectId,
      memberId
    );
    if (!target) {
      throw new Error("User is not a member of this project");
    }

    // 4. Delete membership
    await this.membershipRepo.deleteByProjectAndUser(projectId, memberId);

    return { message: "Member removed successfully" };
  }
}
