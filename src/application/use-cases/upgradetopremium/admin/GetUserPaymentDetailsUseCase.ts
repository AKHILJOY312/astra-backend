// src/application/use-cases/billing/GetUserPaymentDetailsUseCase.ts

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { NotFoundError } from "@/application/error/AppError";
import {
  IGetUserPaymentDetailsUseCase,
  UserBillingSummary,
} from "@/application/ports/use-cases/upgradetopremium/admin";
import { IPaymentAnalyticsRepository } from "@/application/ports/repositories/IPaymentAnalyticsRepository";

@injectable()
export class GetUserPaymentDetailsUseCase implements IGetUserPaymentDetailsUseCase {
  constructor(
    @inject(TYPES.PaymentRepository)
    private _analyticsRepo: IPaymentAnalyticsRepository,
  ) {}

  async execute(userId: string): Promise<UserBillingSummary> {
    // 1. Fetch the aggregated data from the Repository
    // This calls the MongoDB $lookup + $group query we designed
    const summary = await this._analyticsRepo.getAdminSummary(userId);

    if (!summary) {
      throw new NotFoundError("User billing record not found");
    }

    // 2. Map and Return the data
    // We ensure the payment history is returned as clean JSON props
    return {
      user: {
        id: summary.userId.toString(),
        name: summary.user.name,
        email: summary.user.email,
        status: summary.user.status,
        signupDate: summary.user.signupDate,
      },
      subscription: {
        planName: summary.subscription?.planType || "Free/None",

        status: summary.subscription?.status || "inactive",
        startDate: summary.subscription?.startDate,
        endDate: summary.subscription?.endDate,
      },
      stats: {
        ltv: summary.stats.ltv,
        failedCount: summary.stats.failedCount,
        totalTransactions: summary.stats.totalTransactions,
      },
      // Transform raw DB history into Entity-compatible JSON
      paymentHistory: summary.history.map((p) => ({
        _id: p._id.toString(),
        userId: p.userId.toString(),
        planId: p.planId,
        planName: p.planName,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method,
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
        invoiceNumber: p.invoiceNumber,
        billingSnapshot: p.billingSnapshot,
        createdAt: p.createdAt,
      })),
    };
  }
}
