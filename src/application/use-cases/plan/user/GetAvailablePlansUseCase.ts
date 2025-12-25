// src/application/use-cases/plan/GetAvailablePlansUseCase.ts

import { inject, injectable } from "inversify";
import { IPlanRepository } from "../../../ports/repositories/IPlanRepository";
import { Plan } from "@/domain/entities/billing/Plan";
import { TYPES } from "@/config/types";
import { IGetAvailablePlansUseCase } from "@/application/ports/use-cases/plan/user/IGetAvailablePlansUseCase";

@injectable()
export class GetAvailablePlansUseCase implements IGetAvailablePlansUseCase {
  constructor(
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository
  ) {}

  async execute(): Promise<Plan[]> {
    const plans = await this.planRepo.findAllActive();

    // Optional: sort by price or add "popular" logic
    return plans.sort((a, b) => a.finalAmount - b.finalAmount);
  }
}
