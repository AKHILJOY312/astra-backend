// src/core/use-cases/project/CreateProjectUseCase.ts
import { Project } from "../../../domain/entities/project/Project";
import { IProjectRepository } from "../../repositories/IProjectRepository";
import { IPlanRepository } from "../../repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "../../repositories/IUserSubscriptionRepository";

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
    private planRepo: IPlanRepository
  ) {}

  async execute(input: CreateProjectDTO): Promise<CreateProjectResultDTO> {
    const { ownerId, projectName, description, imageUrl } = input;

    // 1. Count current projects
    const currentCount = await this.projectRepo.countByOwnerId(ownerId);

    // 2. Get user subscription + plan limits
    const subscription = await this.subscriptionRepo.findActiveByUserId(
      ownerId
    );
    const planId = subscription?.planType || "free";
    const plan = await this.planRepo.findById(planId);

    if (!plan) throw new Error("Plan not found");

    // 3. Enforce project limit
    if (currentCount >= plan.maxProjects) {
      throw new Error(
        `You have reached the limit of ${plan.maxProjects} projects. Upgrade to create more.`
      );
    }

    // 4. Create project entity
    const project = new Project({
      projectName: projectName.trim(),
      description,
      imageUrl,
      ownerId,
    });

    const savedProject = await this.projectRepo.create(project);

    return { project: savedProject };
  }
}
