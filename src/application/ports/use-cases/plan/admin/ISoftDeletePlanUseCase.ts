// src/application/ports/useCases/ISoftDeletePlan.ts

import { DeletePlanDto, PlanResponseDto } from "@/application/dto/plan";
// import { PlanResponseDTO } from "./ICreatePlanUseCase"; // reuse

export interface ISoftDeletePlan {
  execute(dto: DeletePlanDto): Promise<PlanResponseDto | null>;
}
