// src/infrastructure/persistence/mongoose/repositories/UserSubscriptionRepository.ts
import { IUserSubscriptionRepository } from "../../../../application/repositories/IUserSubscriptionRepository";
import { UserSubscription } from "../../../../domain/entities/billing/UserSubscription";
import {
  UserSubscriptionModel,
  toUserSubscriptionEntity,
} from "../modals/UserSubscriptionModel";

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
    console.log("create: ", subscription);
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
}
