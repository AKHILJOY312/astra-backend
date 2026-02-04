// src/infrastructure/persistence/mongoose/repositories/UserSubscriptionRepository.ts
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import {
  UserSubscriptionModel,
  toUserSubscriptionEntity,
} from "@/infra/db/mongoose/models/UserSubscriptionModel";

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
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const stats = await UserSubscriptionModel.aggregate([
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

          churnedThisMonth: [
            {
              $match: {
                status: "canceled",
                updatedAt: { $gte: startOfMonth },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    // const counts = stats[0].statusCounts;
    // const active = counts.find((c) => c._id === "active")?.count || 0;
    const active = 0;
    // const canceled = stats[0].churnedThisMonth[0]?.count || 0;
    const canceled = 0;

    // Simple Churn Rate Calculation: (Canceled this month / Total Active at start)
    const churnRate = active > 0 ? (canceled / (active + canceled)) * 100 : 0;

    return {
      totalActive: active,
      canceledThisMonth: canceled,
      churnRate: parseFloat(churnRate.toFixed(2)),
    };
  }
}
