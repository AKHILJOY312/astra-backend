// src/core/use-cases/project/RemoveMemberFromProjectUseCase.ts
import { inject, injectable } from "inversify";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import {
  IRemoveMemberFromProjectUseCase,
  RemoveMemberDTO,
  RemoveMemberResultDTO,
} from "@/application/ports/use-cases/project/IRemoveMemberFromProjectUseCase";

@injectable()
export class RemoveMemberFromProjectUseCase
  implements IRemoveMemberFromProjectUseCase
{
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(input: RemoveMemberDTO): Promise<RemoveMemberResultDTO> {
    const { projectId, memberId, requestedBy } = input;

    // 1. Requester must be manager
    const requester = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requester || requester.role !== "manager") {
      throw new UnauthorizedError("Only project managers can remove members");
    }

    // 2. Cannot remove self if you're the only manager
    if (memberId === requestedBy) {
      const managerCount = await this.membershipRepo.countManagersInProject(
        projectId
      );
      if (managerCount <= 1) {
        throw new BadRequestError(
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
      throw new BadRequestError("User is not a member of this project");
    }

    // 4. Delete membership
    await this.membershipRepo.deleteByProjectAndUser(projectId, memberId);

    return { message: "Member removed successfully" };
  }
}
