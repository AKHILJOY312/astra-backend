// application/use-cases/billing/SoftDeletePlan.ts
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { DeletePlanDto, PlanResponseDto } from "@/application/dto/plan";
import { Plan } from "@/domain/entities/billing/Plan";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { ISoftDeletePlan } from "@/application/ports/use-cases/plan/admin/ISoftDeletePlanUseCase";
import { NotFoundError } from "@/application/error/AppError";

@injectable()
export class SoftDeletePlan implements ISoftDeletePlan {
  constructor(
    @inject(TYPES.PlanRepository) private _planRepo: IPlanRepository,
  ) {}

  async execute(dto: DeletePlanDto): Promise<PlanResponseDto | null> {
    const deletedPlan = await this._planRepo.delete(dto.id);
    if (!deletedPlan) {
      throw new NotFoundError("Plan");
    }
    return this.toResponseDto(deletedPlan);
  }
  private toResponseDto(plan: Plan): PlanResponseDto {
    return {
      id: plan.id!,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      finalAmount: plan.finalAmount,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      features: plan.features,
      maxProjects: plan.maxProjects,
      maxMembersPerProject: plan.maxMembersPerProject,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
