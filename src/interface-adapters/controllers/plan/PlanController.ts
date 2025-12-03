// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";
import { CreatePlan } from "../../../application/use-cases/plan/admin/CreatePlan";
import { UpdatePlan } from "../../../application/use-cases/plan/admin/UpdatePlan";
import { SoftDeletePlan } from "../../../application/use-cases/plan/admin/SoftDeletePlan";
import { GetPlansPaginated } from "../../../application/use-cases/plan/admin/GetPlansPaginated";
import { HTTP_STATUS } from "../../http/constants/httpStatus";

export class PlanController {
  constructor(
    private createPlan: CreatePlan,
    private updatePlan: UpdatePlan,
    private deletePlan: SoftDeletePlan,
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
        message: "Plan updated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Update plan error:", error);

      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Failed to update plan",
      });
    }
  };

  delete = async (req: Request, res: Response) => {
    await this.deletePlan.execute({ id: req.params.id });
    res.json({ message: "Plan deleted" });
  };
}
