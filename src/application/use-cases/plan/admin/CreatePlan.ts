import { Plan } from "@/domain/entities/billing/Plan";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { CreatePlanDto, PlanResponseDto } from "@/application/dto/plan";
import { v4 as uuidv4 } from "uuid";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { BadRequestError } from "@/application/error/AppError";
import { ICreatePlan } from "@/application/ports/use-cases/plan/admin/ICreatePlanUseCase";

@injectable()
export class CreatePlan implements ICreatePlan {
  constructor(
    @inject(TYPES.PlanRepository) private _planRepo: IPlanRepository,
  ) {}

  async execute(dto: CreatePlanDto): Promise<PlanResponseDto> {
    const existing = await this._planRepo.findByName(dto.name);
    if (existing) {
      throw new BadRequestError("A plan with this name already exists.");
    }

    const plan = new Plan({
      id: `PLAN-${uuidv4()}`,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      finalAmount: dto.finalAmount,
      currency: dto.currency,
      billingCycle: dto.billingCycle,
      features: dto.features,
      maxProjects: dto.maxProjects,
      maxMembersPerProject: dto.maxMembersPerProject,
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await this._planRepo.create(plan);
    return this.toResponseDto(result);
  }
  private toResponseDto(plan: Plan): PlanResponseDto {
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
