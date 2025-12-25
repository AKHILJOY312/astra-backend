// src/core/use-cases/project/AddMemberToProjectUseCase.ts
import { ProjectMembership } from "../../../domain/entities/project/ProjectMembership";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { IPlanRepository } from "../../ports/repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "../../ports/repositories/IUserSubscriptionRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@/application/error/AppError";
import {
  AddMemberDTO,
  AddMemberResultDTO,
  IAddMemberToProjectUseCase,
} from "@/application/ports/use-cases/project/IAddMemberToProjectUseCase";

@injectable()
export class AddMemberToProjectUseCase implements IAddMemberToProjectUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.ProjectRepository) private projectRepo: IProjectRepository,
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository
  ) {}

  async execute(input: AddMemberDTO): Promise<AddMemberResultDTO> {
    const { projectId, userId, role = "member", requestedBy } = input;

    // 1. Prevent self-add or duplicate
    const existing = await this.membershipRepo.findByProjectAndUser(
      projectId,
      userId
    );

    if (existing) {
      throw new BadRequestError("User is already a member of this project");
    }

    // 2. Check requester is manager
    const requesterMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requesterMembership || requesterMembership.role !== "manager") {
      throw new UnauthorizedError("Only project managers can add members");
    }

    // 3. Count current members
    const memberCount = await this.membershipRepo.countMembersInProject(
      projectId
    );

    // 4. Get project owner to check subscription
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new NotFoundError("Project");

    const ownerSub = await this.subscriptionRepo.findActiveByUserId(
      project.ownerId
    );
    const plan = await this.planRepo.findById(ownerSub?.planType || "free");
    if (!plan) throw new NotFoundError("Plan");

    // 5. Enforce member limit
    if (memberCount >= plan.maxMembersPerProject) {
      throw new UnauthorizedError(
        `Maximum ${plan.maxMembersPerProject} members allowed. Upgrade plan to add more.`
      );
    }

    // 6. Create membership
    const membership = new ProjectMembership({
      projectId,
      userId,
      role,
    });

    const saved = await this.membershipRepo.create(membership);

    return { membership: saved };
  }
}
