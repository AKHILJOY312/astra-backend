// src/application/ports/useCases/IUpdatePlan.ts

// import { UpdatePlanDto } from "@/application/dto/plan/CreatePlanDto";
import { UpdatePlanDto } from "@/application/dto/plan/UpdatePlanDto";
import { Plan } from "@/domain/entities/billing/Plan";
// import { PlanResponseDTO } from "./ICreatePlanUseCase";

export interface IUpdatePlan {
  execute(dto: UpdatePlanDto): Promise<Plan | null>;
}
