// src/application/ports/use-cases/billing/IGetUserPaymentDetailsUseCase.ts

import {
  ChartDataResponse,
  DashboardStats,
  PaymentOverviewOutput,
  UserBillingSummary,
} from "@/application/dto/billing/adminBillingDTOs";

export interface IGetUserPaymentDetailsUseCase {
  execute(userId: string): Promise<UserBillingSummary>;
}
export interface IPaymentOverviewUseCase {
  execute(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaymentOverviewOutput>;
}
export interface IGetAdminDashboardStatsUseCase {
  execute(): Promise<DashboardStats>;
}
export interface IGetAdminAnalyticsUseCase {
  execute(period: string): Promise<ChartDataResponse>;
}
