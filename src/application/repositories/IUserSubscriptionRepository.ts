// src/core/repositories/IUserSubscriptionRepository.ts
import { UserSubscription } from "../../domain/entities/billing/UserSubscription";

export interface IUserSubscriptionRepository {
  create(subscription: UserSubscription): Promise<UserSubscription>;
  update(subscription: UserSubscription): Promise<void>;

  findByUserId(userId: string): Promise<UserSubscription | null>;
  findActiveByUserId(userId: string): Promise<UserSubscription | null>;

  findByRazorpayOrderId(orderId: string): Promise<UserSubscription | null>;
  delete(id: string): Promise<UserSubscription | null>;
}
