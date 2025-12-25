import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { IRazorpayService } from "@/application/ports/services/IRazorpayService";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";
import { ENV } from "@/config/env.config";
import {
  IUpgradeToPlanUseCase,
  UpgradeToPlanInput,
  UpgradeToPlanOutput,
} from "@/application/ports/use-cases/upgradetopremium/IUpgradeToPlanUseCase";

@injectable()
export class UpgradeToPlanUseCase implements IUpgradeToPlanUseCase {
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
      throw new BadRequestError("Invalid or inactive plan");
    }
    if (plan.finalAmount <= 0) {
      throw new BadRequestError("This is a free plan");
    }

    const orderObject = {
      amount: plan.finalAmount * 100,
      currency: plan.currency,
      receipt: `up_${userId.slice(0, 6)}_${planId.slice(0, 6)}`,
      notes: { userId, planId, planName: plan.name },
    };

    const order = await this.razorpayService.createOrder(orderObject);

    let subscription = await this.subscriptionRepo.findByUserId(userId);

    const now = new Date();
    const endDate = this.getNextBillingDate(plan.billingCycle);

    if (subscription) {
      subscription.setPlan(planId, plan.finalAmount, plan.currency);
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
        planType: planId,
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
      keyId: ENV.PAYMENTS.RAZORPAY_ID!,
    };
  }

  private getNextBillingDate(cycle: string): Date {
    const date = new Date();
    if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
    else date.setMonth(date.getMonth() + 1);
    return date;
  }
}
