// src/application/use-cases/plan/GetPlansPaginated.ts
import { IPlanRepository } from "../../../ports/repositories/IPlanRepository";
import { Plan } from "../../../../domain/entities/billing/Plan";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IGetPlansPaginated } from "@/application/ports/use-cases/plan/admin/IGetPlansPaginatedUseCase";

@injectable()
export class GetPlansPaginated implements IGetPlansPaginated {
  constructor(
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository
  ) {}

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
