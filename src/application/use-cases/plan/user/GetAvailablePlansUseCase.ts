// src/application/use-cases/plan/GetAvailablePlansUseCase.ts

import { IPlanRepository } from "../../../repositories/IPlanRepository";
import { Plan } from "@/domain/entities/billing/Plan";

export class GetAvailablePlansUseCase {
  constructor(private planRepo: IPlanRepository) {}

  async execute(): Promise<Plan[]> {
    const plans = await this.planRepo.findAllActive();

    // Optional: sort by price or add "popular" logic
    return plans.sort((a, b) => a.finalAmount - b.finalAmount);
  }
}
