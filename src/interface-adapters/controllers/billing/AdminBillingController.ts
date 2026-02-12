// src/interfaces/controllers/PlanController.ts
import { Request, Response } from "express";

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import {
  IGetAdminAnalyticsUseCase,
  IGetAdminDashboardStatsUseCase,
  IGetUserPaymentDetailsUseCase,
  IPaymentOverviewUseCase,
} from "@/application/ports/use-cases/upgradetopremium/admin";

@injectable()
export class AdminBillingController {
  constructor(
    @inject(TYPES.GetUserPaymentDetailsUseCase)
    private _getPaymentDetailsUC: IGetUserPaymentDetailsUseCase,

    @inject(TYPES.PaymentOverviewUseCase)
    private _getOverviewUC: IPaymentOverviewUseCase,

    @inject(TYPES.GetAdminDashboardStatsUseCase)
    private _getDashboardUC: IGetAdminDashboardStatsUseCase,

    @inject(TYPES.GetAdminAnalyticsUseCase)
    private _getChartUC: IGetAdminAnalyticsUseCase,
  ) {}

  userPaymentDetails = async (req: Request, res: Response) => {
    const userId = req.body.userId;
    const result = await this._getPaymentDetailsUC.execute(userId!);
    res.json({ succuss: true, data: result });
  };

  getPaymentOverview = async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const result = await this._getOverviewUC.execute(page, limit, search);

    res.json({ success: true, data: result });
  };

  dashboardStats = async (req: Request, res: Response) => {
    const result = await this._getDashboardUC.execute();
    res.json({ success: true, data: result });
  };

  getChartsDetails = async (req: Request, res: Response) => {
    const period =
      typeof req.query.period === "string" ? req.query.period : "monthly";

    const result = await this._getChartUC.execute(period);

    res.json({ success: true, data: result });
  };
}
