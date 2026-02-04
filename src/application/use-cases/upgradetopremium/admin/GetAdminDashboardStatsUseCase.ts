// src/application/use-cases/dashboard/GetAdminDashboardStatsUseCase.ts

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import {
  DashboardStats,
  IGetAdminDashboardStatsUseCase,
} from "@/application/ports/use-cases/upgradetopremium/admin";

@injectable()
export class GetAdminDashboardStatsUseCase implements IGetAdminDashboardStatsUseCase {
  constructor(
    @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
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
      this._paymentRepo.getDashboardRevenueMetrics(startOfToday, startOfMonth),
      this._subRepo.getDashboardSubscriptionMetrics(),
      this._userRepo.getDashboardUserMetrics(startOfToday),
    ]);

    return {
      revenue: revStats,
      subscriptions: subStats,
      payments: revStats.paymentStatus,
      userMetrics: userStats,
      planDistribution: revStats.planDistribution,
      lastUpdated: new Date(),
    };
  }
}
