// src/application/ports/useCases/ISoftDeletePlan.ts

import { DeletePlanDto } from "@/application/dto/plan/DeletePlanDto";
import { Plan } from "@/domain/entities/billing/Plan";
// import { PlanResponseDTO } from "./ICreatePlanUseCase"; // reuse

export interface ISoftDeletePlan {
  execute(dto: DeletePlanDto): Promise<Plan | null>;
}
