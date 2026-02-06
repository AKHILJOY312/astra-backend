// src/application/ports/useCases/IUpdatePlan.ts

// import { UpdatePlanDto } from "@/application/dto/plan/CreatePlanDto";
import { PlanResponseDto } from "@/application/dto/plan";
import { UpdatePlanDto } from "@/application/dto/plan";

// import { PlanResponseDTO } from "./ICreatePlanUseCase";

export interface IUpdatePlan {
  execute(dto: UpdatePlanDto): Promise<PlanResponseDto | null>;
}
