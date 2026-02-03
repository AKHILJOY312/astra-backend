// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { PLAN_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { ICreatePlan } from "@/application/ports/use-cases/plan/admin/ICreatePlanUseCase";
import { IUpdatePlan } from "@/application/ports/use-cases/plan/admin/IUpdatePlanUseCase";
import { ISoftDeletePlan } from "@/application/ports/use-cases/plan/admin/ISoftDeletePlanUseCase";
import { IGetPlansPaginated } from "@/application/ports/use-cases/plan/admin/IGetPlansPaginatedUseCase";

@injectable()
export class PlanController {
  constructor(
    @inject(TYPES.CreatePlan) private _createPlan: ICreatePlan,
    @inject(TYPES.UpdatePlan) private _updatePlan: IUpdatePlan,
    @inject(TYPES.SoftDeletePlan) private _deletePlan: ISoftDeletePlan,
    @inject(TYPES.GetPlansPaginated)
    private _getPlansPaginated: IGetPlansPaginated,
  ) {}

  create = async (req: Request, res: Response) => {
    const plan = await this._createPlan.execute(req.body);
    res.status(HTTP_STATUS.CREATED).json(plan);
  };

  getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const result = await this._getPlansPaginated.execute(page, limit);
    res.json(result);
  };

  update = async (req: Request, res: Response) => {
    const dto = {
      id: req.params.id,
      ...req.body,
    };

    const result = await this._updatePlan.execute(dto);

    return res.json({
      success: true,
      message: PLAN_MESSAGES.PLAN_CREATED,
      data: result,
    });
  };

  delete = async (req: Request, res: Response) => {
    await this._deletePlan.execute({ id: req.params.id });
    res.json({ message: PLAN_MESSAGES.PLAN_DELETED });
  };
}
