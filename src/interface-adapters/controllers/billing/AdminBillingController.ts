import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import {
  IGetAdminAnalyticsUseCase,
  IGetAdminDashboardStatsUseCase,
  IGetUserPaymentDetailsUseCase,
  IPaymentOverviewUseCase,
} from "@/application/ports/use-cases/upgradetopremium/admin";
import { ValidationError } from "@/application/error/AppError";
import { HTTP_STATUS } from "../../http/constants/httpStatus";

import {
  UserIdBodySchema,
  PaymentOverviewQuerySchema,
  AnalyticsPeriodQuerySchema,
} from "@/interface-adapters/http/validators/adminBillingValidators";
import { ChartDataInput } from "@/application/dto/billing/adminBillingDTOs";

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
    const result = UserIdBodySchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid user ID");
    }

    const { userId } = result.data;

    const paymentDetails = await this._getPaymentDetailsUC.execute(userId);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: paymentDetails,
    });
  };

  getPaymentOverview = async (req: Request, res: Response) => {
    const queryParsed = PaymentOverviewQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      throw new ValidationError("Invalid query parameters");
    }

    const { page, limit, search } = queryParsed.data;

    const result = await this._getOverviewUC.execute(page, limit, search);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  };

  dashboardStats = async (req: Request, res: Response) => {
    const stats = await this._getDashboardUC.execute();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  };

  getChartsDetails = async (req: Request, res: Response) => {
    const queryParsed = AnalyticsPeriodQuerySchema.safeParse(req.query);
    if (!queryParsed.success) {
      throw new ValidationError("Invalid period parameter");
    }

    const { period } = queryParsed.data;

    const chartData = await this._getChartUC.execute(period as ChartDataInput);

    return res.json({
      success: true,
      data: chartData,
    });
  };
}
