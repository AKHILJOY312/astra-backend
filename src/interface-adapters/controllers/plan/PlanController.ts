// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { PLAN_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { ICreatePlan } from "@/application/ports/use-cases/plan/admin/ICreatePlanUseCase";
import { IUpdatePlan } from "@/application/ports/use-cases/plan/admin/IUpdatePlanUseCase";
import { ISoftDeletePlan } from "@/application/ports/use-cases/plan/admin/ISoftDeletePlanUseCase";
import { IGetPlansPaginated } from "@/application/ports/use-cases/plan/admin/IGetPlansPaginatedUseCase";

@injectable()
export class PlanController {
  constructor(
    @inject(TYPES.CreatePlan) private createPlan: ICreatePlan,
    @inject(TYPES.UpdatePlan) private updatePlan: IUpdatePlan,
    @inject(TYPES.SoftDeletePlan) private deletePlan: ISoftDeletePlan,
    @inject(TYPES.GetPlansPaginated)
    private getPlansPaginated: IGetPlansPaginated
  ) {}

  create = async (req: Request, res: Response) => {
    const plan = await this.createPlan.execute(req.body);
    res.status(HTTP_STATUS.CREATED).json(plan);
  };

  getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const result = await this.getPlansPaginated.execute(page, limit);
    res.json(result);
  };

  update = async (req: Request, res: Response) => {
    const dto = {
      id: req.params.id,
      ...req.body,
    };

    const result = await this.updatePlan.execute(dto);

    return res.json({
      success: true,
      message: PLAN_MESSAGES.PLAN_CREATED,
      data: result,
    });
  };

  delete = async (req: Request, res: Response) => {
    await this.deletePlan.execute({ id: req.params.id });
    res.json({ message: PLAN_MESSAGES.PLAN_DELETED });
  };
}
