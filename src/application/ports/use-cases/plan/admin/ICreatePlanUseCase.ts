// src/application/ports/useCases/ICreatePlan.ts

import { CreatePlanDto } from "@/application/dto/plan/CreatePlanDto";
import { Plan } from "@/domain/entities/billing/Plan";

export interface PlanResponseDTO {
  id: string;
  name: string;
  description?: string;
  price: number;
  finalAmount: number;
  currency: string;
  billingCycle: "monthly" | "yearly"; // adjust based on your enum/type
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePlan {
  execute(dto: CreatePlanDto): Promise<Plan>;
}
