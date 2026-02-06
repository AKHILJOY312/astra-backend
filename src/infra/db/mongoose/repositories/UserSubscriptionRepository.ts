// src/infrastructure/persistence/mongoose/repositories/UserSubscriptionRepository.ts
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import {
  UserSubscriptionModel,
  toUserSubscriptionEntity,
} from "@/infra/db/mongoose/models/UserSubscriptionModel";

type StatusCount = {
  _id: "active" | "pending" | "canceled" | "expired";
  count: number;
};

type CountResult = {
  count: number;
};

type ActiveRevenueResult = {
  _id: null;
  totalAmount: number;
};

type DashboardAggregationResult = {
  statusCounts: StatusCount[];
  newThisMonth: CountResult[];
  canceledThisMonth: CountResult[];
  expiringSoon: CountResult[];
  activeRevenue: ActiveRevenueResult[];
};

export class UserSubscriptionRepository implements IUserSubscriptionRepository {
  async create(subscription: UserSubscription): Promise<UserSubscription> {
    const doc = new UserSubscriptionModel({
      userId: subscription.userId,
      planType: subscription.planType,
      amount: subscription.amount,
      currency: subscription.currency,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status,
      razorPayOrderId: subscription.razorPayOrderId,
    });
    // console.log("create: ", subscription);
    const saved = await doc.save();
    return toUserSubscriptionEntity(saved);
  }

  async update(subscription: UserSubscription): Promise<void> {
    await UserSubscriptionModel.findByIdAndUpdate(subscription.id, {
      planType: subscription.planType,
      amount: subscription.amount,
      currency: subscription.currency,
      endDate: subscription.endDate,
      status: subscription.status,
      razorPayOrderId: subscription.razorPayOrderId,
      razorpayPaymentId: subscription.razorpayPaymentId,
    });
  }

  async findByUserId(userId: string): Promise<UserSubscription | null> {
    const doc = await UserSubscriptionModel.findOne({ userId });
    return doc ? toUserSubscriptionEntity(doc) : null;
  }

  async findActiveByUserId(userId: string): Promise<UserSubscription | null> {
    const doc = await UserSubscriptionModel.findOne({
      userId,
      status: "active",
      $or: [{ endDate: null }, { endDate: { $gt: new Date() } }],
    });
    return doc ? toUserSubscriptionEntity(doc) : null;
  }
  async findByRazorpayOrderId(id: string): Promise<UserSubscription | null> {
    const doc = await UserSubscriptionModel.findOne({
      razorPayOrderId: id,
    });
    return doc ? toUserSubscriptionEntity(doc) : null;
  }

  async delete(id: string): Promise<UserSubscription | null> {
    const doc = await UserSubscriptionModel.findByIdAndDelete(id);
    return doc ? toUserSubscriptionEntity(doc) : null;
  }

  async getDashboardSubscriptionMetrics() {
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const [result] =
      await UserSubscriptionModel.aggregate<DashboardAggregationResult>([
        {
          $facet: {
            statusCounts: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
            newThisMonth: [
              {
                $match: {
                  createdAt: { $gte: startOfMonth, $lt: endOfMonth },
                },
              },
              { $count: "count" },
            ],
            canceledThisMonth: [
              {
                $match: {
                  status: "canceled",
                  updatedAt: { $gte: startOfMonth, $lt: endOfMonth },
                },
              },
              { $count: "count" },
            ],
            expiringSoon: [
              {
                $match: {
                  status: "active",
                  endDate: { $gte: now, $lte: sevenDaysFromNow },
                },
              },
              { $count: "count" },
            ],
            activeRevenue: [
              {
                $match: { status: "active" },
              },
              {
                $group: {
                  _id: null,
                  totalAmount: { $sum: "$amount" },
                },
              },
            ],
          },
        },
      ]);

    // ---- Safe extraction helpers ----
    const statusMap = (result?.statusCounts ?? []).reduce<
      Record<StatusCount["_id"], number>
    >(
      (acc, cur) => {
        acc[cur._id] = cur.count;
        return acc;
      },
      {
        active: 0,
        pending: 0,
        canceled: 0,
        expired: 0,
      },
    );

    const active = statusMap["active"] ?? 0;
    const canceledThisMonth = result?.canceledThisMonth?.[0]?.count ?? 0;
    const newThisMonth = result?.newThisMonth?.[0]?.count ?? 0;
    const expiringSoon = result?.expiringSoon?.[0]?.count ?? 0;

    // ---- Churn Rate ----
    // Simple admin-friendly definition:
    // canceled this month / (active + canceled this month)
    const churnRate =
      active + canceledThisMonth > 0
        ? (canceledThisMonth / (active + canceledThisMonth)) * 100
        : 0;

    return {
      active,
      pending: statusMap["pending"] ?? 0,
      canceled: statusMap["canceled"] ?? 0,
      expired: statusMap["expired"] ?? 0,
      newThisMonth,
      canceledThisMonth,
      expiringSoon,
      churnRate: Number(churnRate.toFixed(2)),
    };
  }
}
