// src/core/use-cases/project/CreateProjectUseCase.ts
import { Project } from "../../../domain/entities/project/Project";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IPlanRepository } from "../../repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "../../repositories/IUserSubscriptionRepository";
import { ProjectMembership } from "../../../domain/entities/project/ProjectMembership";
import { IProjectMembershipRepository } from "../../repositories/IProjectMembershipRepository";

export interface CreateProjectDTO {
  projectName: string;
  description?: string;
  imageUrl?: string | null;
  ownerId: string;
}

export interface CreateProjectResultDTO {
  project: Project;
}

export class CreateProjectUseCase {
  constructor(
    private projectRepo: IProjectRepository,
    private subscriptionRepo: IUserSubscriptionRepository,
    private planRepo: IPlanRepository,
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(input: CreateProjectDTO): Promise<CreateProjectResultDTO> {
    const { ownerId, projectName, description, imageUrl } = input;
    // 1. Count current projects
    const currentCount = await this.projectRepo.countByOwnerId(ownerId);
    console.log("1");
    // 2. Get user subscription + plan limits
    const subscription = await this.subscriptionRepo.findActiveByUserId(
      ownerId
    );
    console.log("Subscription:", subscription);
    console.log("2");
    const planId = subscription?.planType || "free";
    console.log("planId:", planId);
    const plan = await this.planRepo.findById(planId);
    console.log("3");
    if (!plan) throw new Error("Plan not found");

    // 3. Enforce project limit
    if (currentCount >= plan.maxProjects) {
      throw new Error(
        `You have reached the limit of ${plan.maxProjects} projects. Upgrade to create more.`
      );
    }
    console.log("4");
    // 4. Create project entity
    const project = new Project({
      projectName: projectName.trim(),
      description,
      imageUrl,
      ownerId,
    });
    console.log("5");
    const savedProject = await this.projectRepo.create(project);
    const membership = new ProjectMembership({
      projectId: savedProject.id!,
      userId: ownerId,
      role: "manager",
      joinedAt: new Date(),
    });
    console.log("6");
    await this.membershipRepo.create(membership);
    return { project: savedProject };
  }
}
