// src/core/use-cases/project/ListProjectMembersUseCase.ts
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { ProjectMemberView } from "@/application/dto/project/ProjectMemberView";

export interface ListProjectMembersDTO {
  projectId: string;
  requestedBy: string;
}

@injectable()
export class ListProjectMembersUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private readonly membershipRepo: IProjectMembershipRepository,

    @inject(TYPES.ProjectRepository)
    private readonly projectRepo: IProjectRepository
  ) {}

  async execute(input: ListProjectMembersDTO): Promise<ProjectMemberView[]> {
    const { projectId, requestedBy } = input;

    // 1️⃣ Validate project exists
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // 2️⃣ Ensure requester is a member
    const requesterMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );

    if (!requesterMembership) {
      throw new Error("You are not a member of this project");
    }

    // 3️⃣ Fetch all members
    const members = await this.membershipRepo.findMembersWithUserDetails(
      projectId
    );

    return members;
  }
}
