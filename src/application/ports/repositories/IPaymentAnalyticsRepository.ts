// src/application/ports/repositories/dto/AdminPaymentHistoryRow.ts

import { PaymentStatus } from "@/domain/entities/billing/Payment";

export interface AdminPaymentHistoryRow {
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

export type AdminUserSummary = {
  userId: string;
  user: {
    name: string;
    email: string;
    status: "active" | "suspended";
    signupDate: Date;
  };
  subscription: {
    planType: string;
    status: string;
    startDate: Date;
    endDate?: Date | null;
  } | null;
  stats: {
    ltv: number;
    failedCount: number;
    totalTransactions: number;
  };
  history: AdminPaymentHistoryRow[];
};

// type PaymentHistoryItem = {
//   _id: string;
//   amount: number;
//   status: "created" | "captured" | "failed";
//   currency: string;
//   createdAt: Date;
// };

export type AdminDashboardRevenue = {
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

  paymentStatus: {
    today: {
      success: number;
      failed: number;
      pending: number;
    };
    thisMonth: {
      refunds: number;
    };
  };
};
// src/application/ports/repositories/dto/PaymentOverviewRow.ts

export interface PaymentOverviewRow {
  _id: string; // userId
  userName: string;
  userEmail: string;
  planName: string;
  status: "created" | "captured" | "failed" | "pending";
  totalSpent: number;
  failedCount: number;
  lastPaymentDate?: Date;
}
export interface PaymentOverviewRepoResult {
  data: PaymentOverviewRow[];
  total: number;
  totalRevenue: number;
}

export interface IPaymentAnalyticsRepository {
  // admin Dash board
  getAdminSummary(userId: string): Promise<AdminUserSummary | null>;
  getPaymentsOverviews(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaymentOverviewRepoResult>;

  getDashboardRevenueMetrics(
    today: Date,
    month: Date,
  ): Promise<AdminDashboardRevenue>;
}
