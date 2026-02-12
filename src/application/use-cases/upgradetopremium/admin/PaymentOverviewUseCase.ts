// src/application/use-cases/billing/PaymentOverviewUseCase.ts

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IPaymentOverviewUseCase } from "@/application/ports/use-cases/upgradetopremium/admin";
import { IPaymentAnalyticsRepository } from "@/application/ports/repositories/IPaymentAnalyticsRepository";
import { PaymentOverviewOutput } from "@/application/dto/billing/adminBillingDTOs";

@injectable()
export class PaymentOverviewUseCase implements IPaymentOverviewUseCase {
  constructor(
    @inject(TYPES.PaymentAnalyticsRepository)
    private _analyticsRepo: IPaymentAnalyticsRepository,
  ) {}

  async execute(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaymentOverviewOutput> {
    // 1. Fetch data through the repository's optimized overview method
    const { data, total, totalRevenue } =
      await this._analyticsRepo.getPaymentsOverviews(page, limit, search);

    // 2. Map raw database results to a clean Overview Item structure
    const users = data.map((item) => ({
      userId: item._id,
      userName: item.userName,
      userEmail: item.userEmail,
      planName: item.planName || "N/A",
      subscriptionStatus: item.status || "inactive",
      totalSpent: item.totalSpent || 0,
      lastPaymentDate: item.lastPaymentDate,
      failedAttemptCount: item.failedCount || 0,
    }));

    return {
      users,
      totalRevenue,
      activeSubscriptions: total, // Representing total count in search/filter
      totalUsers: total,
    };
  }
}
