// src/core/use-cases/project/AddMemberToProjectUseCase.ts
import {
  ProjectMembership,
  ProjectRole,
} from "../../../domain/entities/project/ProjectMembership";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IProjectMembershipRepository } from "../../repositories/IProjectMembershipRepository";
import { IPlanRepository } from "../../repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "../../repositories/IUserSubscriptionRepository";

export interface AddMemberDTO {
  projectId: string;
  userId: string;
  role?: ProjectRole;
  requestedBy: string;
}

export interface AddMemberResultDTO {
  membership: ProjectMembership;
}

export class AddMemberToProjectUseCase {
  constructor(
    private membershipRepo: IProjectMembershipRepository,
    private projectRepo: IProjectRepository,
    private subscriptionRepo: IUserSubscriptionRepository,
    private planRepo: IPlanRepository
  ) {}

  async execute(input: AddMemberDTO): Promise<AddMemberResultDTO> {
    const { projectId, userId, role = "member", requestedBy } = input;

    // 1. Prevent self-add or duplicate
    const existing = await this.membershipRepo.findByProjectAndUser(
      projectId,
      userId
    );
    if (existing) {
      throw new Error("User is already a member of this project");
    }

    // 2. Check requester is manager
    const requesterMembership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requestedBy
    );
    if (!requesterMembership || requesterMembership.role !== "manager") {
      throw new Error("Only project managers can add members");
    }

    // 3. Count current members
    const memberCount = await this.membershipRepo.countMembersInProject(
      projectId
    );

    // 4. Get project owner to check subscription
    const project = await this.projectRepo.findById(projectId);
    if (!project) throw new Error("Project not found");

    const ownerSub = await this.subscriptionRepo.findActiveByUserId(
      project.ownerId
    );
    const plan = await this.planRepo.findById(ownerSub?.planType || "free");
    if (!plan) throw new Error("Plan not found");

    // 5. Enforce member limit
    if (memberCount >= plan.maxMembersPerProject) {
      throw new Error(
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
