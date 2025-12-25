// application/use-cases/billing/UpdatePlan.ts
import { IPlanRepository } from "../../../ports/repositories/IPlanRepository";
import { UpdatePlanDto } from "../../../dto/plan/UpdatePlanDto";
import { Plan } from "../../../../domain/entities/billing/Plan";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { NotFoundError } from "@/application/error/AppError";
import { IUpdatePlan } from "@/application/ports/use-cases/plan/admin/IUpdatePlanUseCase";

@injectable()
export class UpdatePlan implements IUpdatePlan {
  constructor(
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository
  ) {}

  async execute(dto: UpdatePlanDto): Promise<Plan | null> {
    const plan = await this.planRepo.findById(dto.id);
    if (!plan) throw new NotFoundError("Plan");

    // apply updates only when provided
    if (dto.name !== undefined) plan.setName(dto.name);
    if (dto.description !== undefined) plan.setDescription(dto.description);
    if (dto.price !== undefined) plan.setPrice(dto.price);
    if (dto.finalAmount !== undefined) plan.setFinalAmount(dto.finalAmount);
    if (dto.currency !== undefined) plan.setCurrency(dto.currency);
    if (dto.billingCycle !== undefined) plan.setBillingCycle(dto.billingCycle);
    if (dto.features !== undefined) plan.setFeatures(dto.features);
    if (dto.maxProjects !== undefined) plan.setMaxProjects(dto.maxProjects);
    if (dto.maxMembersPerProject !== undefined)
      plan.setMaxMembersPerProject(dto.maxMembersPerProject);
    if (dto.isActive !== undefined) plan.setActive(dto.isActive);

    plan.setUpdatedAt(new Date());

    await this.planRepo.update(plan);

    return plan;
  }
}
