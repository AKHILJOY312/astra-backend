// src/core/use-cases/project/ListProjectMembersUseCase.ts
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { ProjectMemberView } from "@/application/dto/project/ProjectMemberView";
import { NotFoundError, UnauthorizedError } from "@/application/error/AppError";
import {
  IListProjectMembersUseCase,
  ListProjectMembersDTO,
} from "@/application/ports/use-cases/project/IListProjectMembersUseCase";

@injectable()
export class ListProjectMembersUseCase implements IListProjectMembersUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private readonly membershipRepo: IProjectMembershipRepository,

    @inject(TYPES.ProjectRepository)
    private readonly projectRepo: IProjectRepository
  ) {}

  async execute(input: ListProjectMembersDTO): Promise<ProjectMemberView[]> {
    const { projectId, requestedBy } = input;

    // 1 Validate project exists
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project");
    }

    // 2 Ensure requester is a member
    const requesterMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );

    if (!requesterMembership) {
      throw new UnauthorizedError("You are not a member of this project");
    }

    // Fetch all members
    const members = await this.membershipRepo.findMembersWithUserDetails(
      projectId
    );

    return members;
  }
}
