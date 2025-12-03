// application/use-cases/billing/SoftDeletePlan.ts
import { IPlanRepository } from "../../../repositories/IPlanRepository";
import { DeletePlanDto } from "../../../dto/plan/DeletePlanDto";
import { Plan } from "../../../../domain/entities/billing/Plan";

export class SoftDeletePlan {
  constructor(private planRepo: IPlanRepository) {}

  async execute(dto: DeletePlanDto): Promise<Plan | null> {
    const deletedPlan = await this.planRepo.delete(dto.id);
    return deletedPlan;
  }
}
