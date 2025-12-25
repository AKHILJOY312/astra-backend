// src/application/ports/useCases/IGetPlansPaginated.ts

import { Plan } from "@/domain/entities/billing/Plan";
// import { PlanResponseDTO } from "./ICreatePlanUseCase"; // reuse

export interface PaginatedPlansResponse {
  plans: Plan[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface IGetPlansPaginated {
  execute(page?: number, limit?: number): Promise<PaginatedPlansResponse>;
}
