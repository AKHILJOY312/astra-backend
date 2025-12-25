// src/core/use-cases/project/CreateProjectUseCase.ts
import { Project } from "../../../domain/entities/project/Project";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { IPlanRepository } from "../../ports/repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "../../ports/repositories/IUserSubscriptionRepository";
import { ProjectMembership } from "../../../domain/entities/project/ProjectMembership";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  NotFoundError,
  PlanLimitError,
} from "@/application/error/AppError";

import {
  CreateProjectDTO,
  CreateProjectResultDTO,
  ICreateProjectUseCase,
} from "@/application/ports/use-cases/project/ICreateProjectUseCase";

@injectable()
export class CreateProjectUseCase implements ICreateProjectUseCase {
  constructor(
    @inject(TYPES.ProjectRepository) private projectRepo: IProjectRepository,
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(input: CreateProjectDTO): Promise<CreateProjectResultDTO> {
    const { ownerId, projectName, description, imageUrl } = input;
    // 1. Count current projects
    const currentCount = await this.projectRepo.countByOwnerId(ownerId);
    const sameNameExist = await this.projectRepo.existsByNameAndOwnerId(
      projectName,
      ownerId
    );
    if (sameNameExist) {
      throw new BadRequestError(
        "Project with this same name exists. Try a another name."
      );
    }
    // 2. Get user subscription + plan limits
    const subscription = await this.subscriptionRepo.findActiveByUserId(
      ownerId
    );

    const planId = subscription?.planType || "free";

    const plan = await this.planRepo.findById(planId);

    if (!plan) throw new NotFoundError("Plan");

    // 3. Enforce project limit
    if (currentCount >= plan.maxProjects) {
      throw new PlanLimitError(plan.maxProjects);
    }

    // 4. Create project entity
    const project = new Project({
      projectName: projectName.trim(),
      description,
      imageUrl,
      ownerId,
    });

    const savedProject = await this.projectRepo.create(project);
    const membership = new ProjectMembership({
      projectId: savedProject.id!,
      userId: ownerId,
      role: "manager",
      joinedAt: new Date(),
    });

    await this.membershipRepo.create(membership);
    return { project: savedProject };
  }
}
