import {
  AdminDashboardRevenue,
  AdminUserSummary,
  IPaymentAnalyticsRepository,
  PaymentOverviewRow,
} from "@/application/ports/repositories/IPaymentAnalyticsRepository";
import { PaymentModel } from "../models/PaymentModel";
import mongoose, { PipelineStage } from "mongoose";
import { ChartDataResponse } from "@/application/dto/billing/adminBillingDTOs";

export class PaymentAnalyticsRepository implements IPaymentAnalyticsRepository {
  async getAdminSummary(userId: string): Promise<AdminUserSummary> {
    const summary = await PaymentModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $lookup: {
          from: "usersubscriptions",
          localField: "userId",
          foreignField: "userId",
          as: "subData",
        },
      },
      { $unwind: { path: "$subData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$userId",
          user: { $first: "$userData" },
          subscription: { $first: "$subData" },
          ltv: {
            $sum: { $cond: [{ $eq: ["$status", "captured"] }, "$amount", 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalTx: { $count: {} },
          history: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          userId: "$_id",
          user: {
            name: "$user.name",
            email: "$user.email",
            status: { $cond: ["$user.isBlocked", "suspended", "active"] },
            signupDate: "$user.createdAt",
          },
          subscription: 1,
          stats: {
            ltv: "$ltv",
            failedCount: "$failedCount",
            totalTransactions: "$totalTx",
          },
          history: { $slice: ["$history", 10] },
        },
      },
    ]);

    return summary[0];
  }

  async getPaymentsOverviews(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    // Build search filter
    const matchFilter: PipelineStage.Match["$match"] = {};
    if (search) {
      matchFilter.$or = [
        { "billingSnapshot.userName": { $regex: search, $options: "i" } },
        { "billingSnapshot.userEmail": { $regex: search, $options: "i" } },
      ];
    }

    const result = await PaymentModel.aggregate<{
      metadata: { total: number; totalRevenue: number }[];
      data: PaymentOverviewRow[];
    }>([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          userName: { $first: "$billingSnapshot.userName" },
          userEmail: { $first: "$billingSnapshot.userEmail" },
          planName: { $first: "$planName" },
          status: { $first: "$status" },
          totalSpent: {
            $sum: { $cond: [{ $eq: ["$status", "captured"] }, "$amount", 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          lastPaymentDate: { $max: "$createdAt" },
        },
      },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            { $addFields: { totalRevenue: { $sum: "$totalSpent" } } },
          ],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const metadata = result[0].metadata[0] || { total: 0, totalRevenue: 0 };

    return {
      data: result[0]?.data ?? [],
      total: metadata.total,
      totalRevenue: metadata.totalRevenue,
    };
  }

  async getDashboardRevenueMetrics(
    today: Date,
    month: Date,
  ): Promise<AdminDashboardRevenue> {
    const stats = await PaymentModel.aggregate([
      {
        $facet: {
          // Section A: Revenue & Section C: Status
          metrics: [
            {
              $group: {
                _id: null,
                todayRev: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "captured"] },
                          { $gte: ["$createdAt", today] },
                        ],
                      },
                      "$amount",
                      0,
                    ],
                  },
                },
                monthRev: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "captured"] },
                          { $gte: ["$createdAt", month] },
                        ],
                      },
                      "$amount",
                      0,
                    ],
                  },
                },
                successCount: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "captured"] },
                          { $gte: ["$createdAt", today] },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
                failedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
                },
                pendingCount: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
              },
            },
          ],
          // Section E: Plan Distribution
          planDist: [
            { $match: { status: "captured" } },
            {
              $group: {
                _id: "$planName",
                userCount: { $addToSet: "$userId" },
                revenue: { $sum: "$amount" },
              },
            },
            {
              $project: {
                planName: "$_id",
                userCount: { $size: "$userCount" },
                revenue: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    const m = stats[0].metrics[0] || {};
    return {
      revenue: {
        mrr: m.monthRev || 0,
        today: m.todayRev || 0,
        thisMonth: m.monthRev || 0,
        monthOverMonthChange: 0,
        byPlan: stats[0].planDist,
      },
      paymentStatus: {
        today: {
          success: m.successCount || 0,
          failed: m.failedCount || 0,
          pending: m.pendingCount || 0,
        },
        thisMonth: {
          refunds: 0,
        },
      },
    };
  }

  async getTimeSeriesChartData(
    startDate: Date,
    groupBy: string,
  ): Promise<ChartDataResponse> {
    const getGroupId = () => {
      if (groupBy === "year") {
        return { $dateToString: { format: "%Y", date: "$createdAt" } };
      }
      if (groupBy === "quarter") {
        return {
          $concat: [
            { $dateToString: { format: "%Y", date: "$createdAt" } },
            "-Q",
            {
              $toString: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
            },
          ],
        };
      }
      // Default to Monthly
      return { $dateToString: { format: "%b", date: "$createdAt" } };
    };

    const pipeline: PipelineStage[] = [
      { $match: { status: "captured", createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: getGroupId(),
          sales: { $sum: 1 },
          revenue: { $sum: "$amount" },
          sortDate: { $min: "$createdAt" },
        },
      },
      { $sort: { sortDate: 1 } },
    ];

    const results = await PaymentModel.aggregate(pipeline);

    return {
      categories: results.map((r) => r._id),
      sales: results.map((r) => r.sales),
      revenue: results.map((r) => r.revenue),
    };
  }
}
