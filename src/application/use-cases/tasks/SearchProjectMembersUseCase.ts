import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";

import { UnauthorizedError } from "@/application/error/AppError";
import {
  SearchMembersRequestDTO,
  MemberSearchResponseDTO,
} from "@/application/dto/task/taskDto";
import { ISearchProjectMembersUseCase } from "@/application/ports/use-cases/task/interfaces";
import { IMemberRepository } from "@/application/ports/repositories/IMemberRepository ";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";

@injectable()
export class SearchProjectMembersUseCase implements ISearchProjectMembersUseCase {
  constructor(
    @inject(TYPES.MemberRepository)
    private memberRepo: IMemberRepository,

    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
  ) {}

  async execute(
    input: SearchMembersRequestDTO,
    managerId: string,
  ): Promise<MemberSearchResponseDTO> {
    const membership = await this.membershipRepo.findByProjectAndUser(
      input.projectId,
      managerId,
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only managers can search members");
    }

    const members = await this.memberRepo.searchMembersByProject(
      input.projectId,
      input.query,
    );

    return { members };
  }
}
