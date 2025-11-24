// src/core/use-cases/subscription/GetUserLimitsUseCase.ts
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IProjectMembershipRepository } from "../../repositories/IProjectMembershipRepository";
import { IUserSubscriptionRepository } from "../../repositories/IUserSubscriptionRepository";
import { IPlanRepository } from "../../repositories/IPlanRepository";

export interface UserLimitsDTO {
  currentProjects: number;
  maxProjects: number;
  currentMembersInProject?: number; // per project
  maxMembersPerProject: number;
  planType: string;
  canCreateProject: boolean;
  canAddMember: boolean;
}

export class GetUserLimitsUseCase {
  constructor(
    private projectRepo: IProjectRepository,
    private membershipRepo: IProjectMembershipRepository,
    private subscriptionRepo: IUserSubscriptionRepository,
    private planRepo: IPlanRepository
  ) {}

  async execute(userId: string, projectId?: string): Promise<UserLimitsDTO> {
    const projectCount = await this.projectRepo.countByOwnerId(userId);
    const subscription = await this.subscriptionRepo.findActiveByUserId(userId);
    const plan = await this.planRepo.findById(subscription?.planType || "free");

    const limits = {
      currentProjects: projectCount,
      maxProjects: plan?.maxProjects || 5,
      maxMembersPerProject: plan?.maxMembersPerProject || 5,
      planType: subscription?.planType || "free",
      currentMembersInProject: projectId
        ? await this.membershipRepo.countMembersInProject(projectId)
        : undefined,
      canCreateProject: projectCount < (plan?.maxProjects || 5),
      canAddMember:
        !projectId ||
        (await this.membershipRepo.countMembersInProject(projectId)) <
          (plan?.maxMembersPerProject || 5),
    };

    return limits;
  }
}
