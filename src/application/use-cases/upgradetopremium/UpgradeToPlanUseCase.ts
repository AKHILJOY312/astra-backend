import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { IRazorpayService } from "@/application/ports/services/IRazorpayService";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

export interface UpgradeToPlanInput {
  userId: string;
  planId: string;
}

export interface UpgradeToPlanOutput {
  subscription: UserSubscription;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

@injectable()
export class UpgradeToPlanUseCase {
  constructor(
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository,
    @inject(TYPES.PaymentService) private razorpayService: IRazorpayService
  ) {}

  async execute(input: UpgradeToPlanInput): Promise<UpgradeToPlanOutput> {
    const { userId, planId } = input;

    const plan = await this.planRepo.findById(planId);
    if (!plan || !plan.isActive) {
      throw new Error("Invalid or inactive plan");
    }
    if (plan.finalAmount <= 0) {
      throw new Error("This is a free plan");
    }

    const orderObject = {
      amount: plan.finalAmount * 100,
      currency: plan.currency,
      receipt: `up_${userId.slice(0, 6)}_${planId.slice(0, 6)}`,
      notes: { userId, planId, planName: plan.name },
    };

    const order = await this.razorpayService.createOrder(orderObject);
    console.log("order: ", order);
    let subscription = await this.subscriptionRepo.findByUserId(userId);

    const now = new Date();
    const endDate = this.getNextBillingDate(plan.billingCycle);

    if (subscription) {
      subscription.setPlan(planId as any, plan.finalAmount, plan.currency);
      subscription.setStatus("pending");
      subscription.setOrderId(order.id);
      subscription.setStartDate(now);
      subscription.setEndDate(endDate);
      subscription.setUpdatedAt(now);
      console.log("subscriptioin: ", subscription);
      await this.subscriptionRepo.update(subscription);
    } else {
      subscription = new UserSubscription({
        userId,
        planType: planId as any,
        amount: plan.finalAmount,
        currency: plan.currency,
        startDate: now,
        endDate,
        status: "pending",
        razorPayOrderId: order.id,
      });
      subscription = await this.subscriptionRepo.create(subscription);
    }

    return {
      subscription,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }

  private getNextBillingDate(cycle: string): Date {
    const date = new Date();
    if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
    else date.setMonth(date.getMonth() + 1);
    return date;
  }
}
