// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";
import { CreatePlan } from "../../../application/use-cases/billing/plan/CreatePlan";
import { UpdatePlan } from "../../../application/use-cases/billing/plan/UpdatePlan";
import { SoftDeletePlan } from "../../../application/use-cases/billing/plan/SoftDeletePlan";
import { GetPlansPaginated } from "../../../application/use-cases/billing/plan/GetPlansPaginated";

export class PlanController {
  constructor(
    private createPlan: CreatePlan,
    private updatePlan: UpdatePlan,
    private deletePlan: SoftDeletePlan,
    private getPlansPaginated: GetPlansPaginated
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const plan = await this.createPlan.execute(req.body);
      res.status(201).json(plan);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
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
    await this.updatePlan.execute(dto);
    res.json({ message: "Plan updated" });
  };

  delete = async (req: Request, res: Response) => {
    await this.deletePlan.execute({ id: req.params.id });
    res.json({ message: "Plan deleted" });
  };
}
