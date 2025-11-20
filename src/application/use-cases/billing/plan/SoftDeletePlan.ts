// application/use-cases/billing/SoftDeletePlan.ts
import { IPlanRepository } from "../../../repositories/IPlanRepository";
import { DeletePlanDto } from "../../../dto/plan/DeletePlanDto";
import { Plan } from "../../../../domain/entities/billing/Plan";

export class SoftDeletePlan {
  constructor(private planRepo: IPlanRepository) {}

  async execute(dto: DeletePlanDto): Promise<Plan | null> {
    const plan = await this.planRepo.findById(dto.id);
    if (!plan) {
      throw new Error("Plan not found");
    }

    // soft delete = deactivate plan
    plan.deactivate();
    plan.setUpdatedAt(new Date());

    await this.planRepo.update(plan);

    return plan;
  }
}
