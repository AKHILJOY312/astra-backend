// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";
import { CreatePlan } from "../../../application/use-cases/plan/admin/CreatePlan";
import { UpdatePlan } from "../../../application/use-cases/plan/admin/UpdatePlan";
import { SoftDeletePlan } from "../../../application/use-cases/plan/admin/SoftDeletePlan";
import { GetPlansPaginated } from "../../../application/use-cases/plan/admin/GetPlansPaginated";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { PLAN_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class PlanController {
  constructor(
    @inject(TYPES.CreatePlan) private createPlan: CreatePlan,
    @inject(TYPES.UpdatePlan) private updatePlan: UpdatePlan,
    @inject(TYPES.SoftDeletePlan) private deletePlan: SoftDeletePlan,
    @inject(TYPES.GetPlansPaginated)
    private getPlansPaginated: GetPlansPaginated
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const plan = await this.createPlan.execute(req.body);
      res.status(HTTP_STATUS.CREATED).json(plan);
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
    }
  };

  getAll = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const result = await this.getPlansPaginated.execute(page, limit);
    res.json(result);
  };

  update = async (req: Request, res: Response) => {
    try {
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
    } catch (error: any) {
      console.error("Update plan error:", error);

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || PLAN_MESSAGES.PLAN_UPDATE_FAILED,
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    await this.deletePlan.execute({ id: req.params.id });
    res.json({ message: PLAN_MESSAGES.PLAN_DELETED });
  };
}
