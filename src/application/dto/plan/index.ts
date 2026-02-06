import { Plan } from "@/domain/entities/billing/Plan";

export interface CreatePlanDto {
  name: string;
  description: string;
  price: number;
  finalAmount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  maxStorage: number;
}

// application/dtos/DeletePlanDto.ts
export interface DeletePlanDto {
  id: string;
}

// application/dtos/UpdatePlanDto.ts
export interface UpdatePlanDto {
  id: string; // required to update
  name?: string;
  description?: string;
  price?: number;
  finalAmount?: number;
  currency?: string;
  billingCycle?: "monthly" | "yearly";
  features?: string[];
  maxProjects?: number;
  maxMembersPerProject?: number;
  isActive?: boolean; // optional toggle
}

// application/dto/plan/PlanResponseDto.ts
export interface PlanResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  finalAmount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mapper function (can be a static method or a standalone utility)
export class PlanMapper {
  static toResponseDto(plan: Plan): PlanResponseDto {
    return {
      id: plan.id!,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      finalAmount: plan.finalAmount,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      features: plan.features,
      maxProjects: plan.maxProjects,
      maxMembersPerProject: plan.maxMembersPerProject,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}
