// src/application/use-cases/dashboard/GetAdminDashboardStatsUseCase.ts

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IGetAdminDashboardStatsUseCase } from "@/application/ports/use-cases/upgradetopremium/admin";
import { IPaymentAnalyticsRepository } from "@/application/ports/repositories/IPaymentAnalyticsRepository";
import { DashboardStats } from "@/application/dto/billing/adminBillingDTOs";

@injectable()
export class GetAdminDashboardStatsUseCase implements IGetAdminDashboardStatsUseCase {
  constructor(
    @inject(TYPES.PaymentAnalyticsRepository)
    private _analyticsRepo: IPaymentAnalyticsRepository,
    @inject(TYPES.UserSubscriptionRepository)
    private _subRepo: IUserSubscriptionRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(): Promise<DashboardStats> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Run parallel queries for speed
    const [revStats, subStats, userStats] = await Promise.all([
      this._analyticsRepo.getDashboardRevenueMetrics(
        startOfToday,
        startOfMonth,
      ),
      this._subRepo.getDashboardSubscriptionMetrics(),
      this._userRepo.getDashboardUserMetrics(startOfToday),
    ]);

    return {
      revenue: revStats.revenue,
      subscriptions: subStats,
      payments: revStats.paymentStatus,
      users: userStats,
      lastUpdated: new Date(),
    };
  }
}
