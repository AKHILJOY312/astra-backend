// src/application/ports/use-cases/billing/IGetUserPaymentDetailsUseCase.ts

import { PaymentProps } from "@/domain/entities/billing/Payment";

export interface UserBillingSummary {
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    signupDate: Date;
  };
  subscription: {
    planName: string;
    amount: number;
    currency: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    trialEndDate?: Date;
  };
  stats: {
    ltv: number;
    failedCount: number;
    totalTransactions: number;
  };
  paymentHistory: PaymentProps[];
}

export interface IGetUserPaymentDetailsUseCase {
  execute(userId: string): Promise<UserBillingSummary>;
}

export interface PaymentOverviewItem {
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  subscriptionStatus: string;
  totalSpent: number;
  lastPaymentDate?: Date;
  failedAttemptCount: number;
}

export interface PaymentOverviewOutput {
  users: PaymentOverviewItem[];
  totalRevenue: number;
  activeSubscriptions: number;
  totalUsers: number;
}

export interface IPaymentOverviewUseCase {
  execute(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaymentOverviewOutput>;
}

// src/application/ports/use-cases/dashboard/IGetAdminDashboardStatsUseCase.ts

export interface DashboardStats {
  revenue: {
    mrr: number;
    today: number;
    thisMonth: number;
    changePercentage: number;
  };
  subscriptions: {
    totalActive: number;

    churnRate: number;
  };
  payments: {
    successToday: number;
    failedCount: number;
    pendingCount: number;
    refundsMonth: number;
  };
  userMetrics: {
    total: number;
    newToday: number;
    newThisWeek: number;
  };
  planDistribution: {
    planName: string;
    userCount: number;
    revenue: number;
  }[];
  lastUpdated: Date;
}

export interface IGetAdminDashboardStatsUseCase {
  execute(): Promise<DashboardStats>;
}
