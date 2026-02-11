// src/application/ports/use-cases/billing/IGetUserPaymentDetailsUseCase.ts

import { PaymentStatus } from "@/domain/entities/billing/Payment";

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
    // amount: number;
    // currency: string;
    status: string;
    startDate?: Date;
    endDate?: Date | null;
  };
  stats: {
    ltv: number;
    failedCount: number;
    totalTransactions: number;
  };
  paymentHistory: AdminPaymentHistoryRow[];
}
interface AdminPaymentHistoryRow {
  _id: string;
  userId: string;
  planId?: string;
  planName?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  billingSnapshot?: unknown;
  createdAt: Date;
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

export interface DashboardStats {
  revenue: {
    mrr: number;
    today: number;
    thisMonth: number;
    monthOverMonthChange: number;
    byPlan: {
      planName: string;
      userCount: number;
      revenue: number;
    }[];
  };

  subscriptions: {
    active: number;
    pending: number;
    canceled: number;
    expired: number;
    newThisMonth: number;
    canceledThisMonth: number;
    expiringSoon: number;
    churnRate: number;
  };
  payments: {
    today: {
      success: number;
      failed: number;
      pending: number;
    };
    thisMonth: {
      refunds: number;
    };
  };
  users: {
    total: number;
    active: number;
    inactive: number;
    new: {
      today: number;
      thisWeek: number;
    };
  };

  lastUpdated: Date;
}

export interface IGetAdminDashboardStatsUseCase {
  execute(): Promise<DashboardStats>;
}
export interface ChartDataResponse {
  categories: string[];
  sales: number[];
  revenue: number[];
}

export interface IGetAdminAnalyticsUseCase {
  execute(period: string): Promise<ChartDataResponse>;
}
