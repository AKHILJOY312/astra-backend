import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IPaymentAnalyticsRepository } from "@/application/ports/repositories/IPaymentAnalyticsRepository";
import { IGetAdminAnalyticsUseCase } from "@/application/ports/use-cases/upgradetopremium/admin";
import { ChartDataResponse } from "@/application/dto/billing/adminBillingDTOs";

@injectable()
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
  constructor(
    @inject(TYPES.PaymentAnalyticsRepository)
    private _analyticsRepo: IPaymentAnalyticsRepository,
  ) {}

  async execute(period: string): Promise<ChartDataResponse> {
    // Determine the date range and grouping format based on period
    const now = new Date();
    let startDate: Date;
    let groupBy: "month" | "year" | "quarter";
    console.log("period:", period);
    switch (period) {
      case "annually":
        startDate = new Date(now.getFullYear() - 4, 0, 1); // Last 5 years
        groupBy = "year";
        break;
      case "quarterly":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); // Last 12 months in quarters
        groupBy = "quarter";
        break;
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), 0, 1); // Current year months
        groupBy = "month";
        break;
    }

    return this._analyticsRepo.getTimeSeriesChartData(startDate, groupBy);
  }
}
