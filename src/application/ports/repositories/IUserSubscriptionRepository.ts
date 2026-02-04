// src/core/repositories/IUserSubscriptionRepository.ts
import { UserSubscription } from "../../../domain/entities/billing/UserSubscription";

export interface IUserSubscriptionRepository {
  create(subscription: UserSubscription): Promise<UserSubscription>;
  update(subscription: UserSubscription): Promise<void>;
  delete(id: string): Promise<UserSubscription | null>;

  findByUserId(userId: string): Promise<UserSubscription | null>;
  findActiveByUserId(userId: string): Promise<UserSubscription | null>;
  findByRazorpayOrderId(orderId: string): Promise<UserSubscription | null>;

  getDashboardSubscriptionMetrics(): Promise<{
    totalActive: number;
    canceledThisMonth: number;
    churnRate: number;
  }>;
}
