import { Plan } from "../../../../domain/entities/billing/Plan";
import { IPlanRepository } from "../../../ports/repositories/IPlanRepository";
import { CreatePlanDto } from "../../../dto/plan/CreatePlanDto";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class CreatePlan {
  constructor(
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository
  ) {}

  async execute(dto: CreatePlanDto): Promise<Plan> {
    const existing = await this.planRepo.findByName(dto.name);
    if (existing) {
      throw new Error("A plan with this name already exists.");
    }

    const plan = new Plan({
      id: `PLAN-${uuidv4()}`,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      finalAmount: dto.finalAmount,
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      features: dto.features,
      maxProjects: dto.maxProjects,
      maxMembersPerProject: dto.maxMembersPerProject,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.planRepo.create(plan);
  }
}
