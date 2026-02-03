// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IGetUserPaymentDetailsUseCase } from "@/application/ports/use-cases/upgradetopremium/admin";

@injectable()
export class AdminBillingController {
  constructor(
    @inject(TYPES.GetUserPaymentDetailsUseCase)
    private _getPaymentDetailsUC: IGetUserPaymentDetailsUseCase,
  ) {}

  userPaymentDetails = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const result = await this._getPaymentDetailsUC.execute(userId!);
    res.json({ succuss: true, data: result });
  };
}
