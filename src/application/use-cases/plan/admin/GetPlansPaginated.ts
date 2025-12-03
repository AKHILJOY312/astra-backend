// src/application/use-cases/plan/GetPlansPaginated.ts
import { IPlanRepository } from "../../../repositories/IPlanRepository";
import { Plan } from "../../../../domain/entities/billing/Plan";

export class GetPlansPaginated {
  constructor(private planRepo: IPlanRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    plans: Plan[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  }> {
    const [plans, total] = await Promise.all([
      this.planRepo.findAllPaginated(page, limit),
      this.planRepo.count(),
    ]);

    return {
      plans,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    };
  }
}
