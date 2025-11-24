// src/core/use-cases/subscription/UpgradeSubscriptionUseCase.ts
import {
  UserSubscription,
  PlanType,
} from "../../../domain/entities/billing/UserSubscription";
import { IUserSubscriptionRepository } from "../../repositories/IUserSubscriptionRepository";
import { IPlanRepository } from "../../repositories/IPlanRepository";

export interface UpgradeSubscriptionDTO {
  userId: string;
  newPlanId: PlanType; // e.g., "premium"
  amount: number;
  currency: string;
  stripeSubscriptionId?: string;
  endDate?: Date;
}

export interface UpgradeSubscriptionResultDTO {
  subscription: UserSubscription;
}

export class UpgradeSubscriptionUseCase {
  constructor(
    private subscriptionRepo: IUserSubscriptionRepository,
    private planRepo: IPlanRepository
  ) {}

  async execute(
    input: UpgradeSubscriptionDTO
  ): Promise<UpgradeSubscriptionResultDTO> {
    const {
      userId,
      newPlanId,
      amount,
      currency,
      stripeSubscriptionId,
      endDate,
    } = input;

    const plan = await this.planRepo.findById(newPlanId);
    if (!plan || !plan.isActive || plan.isDeleted) {
      throw new Error("Invalid or inactive plan");
    }

    let subscription = await this.subscriptionRepo.findByUserId(userId);

    if (subscription) {
      // Update existing
      subscription = new UserSubscription({
        ...subscription.toJSON(),
        planType: newPlanId,
        amount,
        currency,
        startDate: new Date(),
        endDate: endDate || undefined,
        status: "active",
        stripeSubscriptionId,
      });
      subscription.setUpdatedAt(new Date());
      await this.subscriptionRepo.update(subscription);
    } else {
      // Create new
      subscription = new UserSubscription({
        userId,
        planType: newPlanId,
        amount,
        currency,
        startDate: new Date(),
        endDate: endDate || undefined,
        status: "active",
        stripeSubscriptionId,
      });
      subscription = await this.subscriptionRepo.create(subscription);
    }

    return { subscription };
  }
}
