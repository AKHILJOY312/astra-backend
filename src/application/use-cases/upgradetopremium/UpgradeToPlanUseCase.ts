import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { IRazorpayService } from "@/application/ports/services/IRazorpayService";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { BadRequestError, NotFoundError } from "@/application/error/AppError";
import { ENV } from "@/config/env.config";
import {
  IUpgradeToPlanUseCase,
  UpgradeToPlanInput,
  UpgradeToPlanOutput,
} from "@/application/ports/use-cases/upgradetopremium/IUpgradeToPlanUseCase";
import { Plan } from "@/domain/entities/billing/Plan";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { Payment } from "@/domain/entities/billing/Payment";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { User } from "@/domain/entities/user/User";

@injectable()
export class UpgradeToPlanUseCase implements IUpgradeToPlanUseCase {
  constructor(
    @inject(TYPES.UserSubscriptionRepository)
    private _subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PlanRepository) private _planRepo: IPlanRepository,
    @inject(TYPES.PaymentRepository) private _paymentRepo: IPaymentRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.PaymentService) private _razorpaySvc: IRazorpayService,
  ) {}

  async execute(input: UpgradeToPlanInput): Promise<UpgradeToPlanOutput> {
    const { userId, planId } = input;

    const plan = await this._planRepo.findById(planId);
    if (!plan || !plan.isActive) {
      throw new BadRequestError("Invalid or inactive plan");
    }

    if (plan.finalAmount <= 0) {
      throw new BadRequestError("Free plan cannot be purchased");
    }

    const user = await this._userRepo.findById(userId);
    if (!user) throw new BadRequestError("User not found");

    const existingSubscription =
      await this._subscriptionRepo.findByUserId(userId);

    // =========================
    //  ACTIVE SUBSCRIPTION → UPGRADE
    // =========================
    if (
      existingSubscription &&
      existingSubscription.status === "active" &&
      existingSubscription.endDate &&
      existingSubscription.endDate > new Date()
    ) {
      const currentPlan = await this._planRepo.findById(
        existingSubscription.planType,
      );
      if (!currentPlan) {
        throw new BadRequestError("Current plan not found");
      }

      if (!this.isUpgrade(currentPlan, plan)) {
        throw new BadRequestError("You can only upgrade to a higher plan");
      }

      return this.createUpgradePayment(
        existingSubscription,
        currentPlan,
        plan,
        user,
      );
    }

    // =========================
    //  NEW SUBSCRIPTION
    // =========================
    return this.createNewSubscriptionPayment(plan, user);
  }

  // =========================
  //  NEW SUBSCRIPTION FLOW
  // =========================
  private async createNewSubscriptionPayment(
    plan: Plan,
    user: User,
  ): Promise<UpgradeToPlanOutput> {
    if (!user) {
      throw new NotFoundError("User");
    }
    const order = await this._razorpaySvc.createOrder({
      amount: plan.finalAmount * 100,
      currency: plan.currency,
      receipt: `sub_${user.id!.slice(0, 6)}`,
      notes: { userId: user.id as string, planId: plan.id as string },
    });

    const payment = new Payment({
      userId: user.id as string,
      planId: plan.id as string,
      planName: plan.name,
      amount: plan.finalAmount,
      currency: plan.currency,
      status: "pending",
      method: "Razorpay Online",
      razorpayOrderId: order.id,
      billingSnapshot: {
        userName: user.name,
        userEmail: user.email,
      },
    });

    await this._paymentRepo.create(payment);

    return {
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: ENV.PAYMENTS.RAZORPAY_ID!,
    };
  }

  // =========================
  //  UPGRADE FLOW
  // =========================
  private async createUpgradePayment(
    subscription: UserSubscription,
    currentPlan: Plan,
    newPlan: Plan,
    user: User,
  ): Promise<UpgradeToPlanOutput> {
    if (!subscription.startDate || !subscription.endDate) {
      throw new BadRequestError("Invalid subscription period");
    }

    const now = new Date();
    const remainingMs = subscription.endDate.getTime() - now.getTime();
    const totalMs =
      subscription.endDate.getTime() - subscription.startDate.getTime();

    const unusedAmount = (remainingMs / totalMs) * subscription.amount;

    const rawPayableAmount = newPlan.finalAmount - unusedAmount;

    const payableAmount = Math.max(Math.round(rawPayableAmount), 0);

    if (payableAmount <= 0) {
      throw new BadRequestError("Upgrade not required");
    }

    const order = await this._razorpaySvc.createOrder({
      amount: payableAmount * 100,
      currency: newPlan.currency,
      receipt: `upgrade_${subscription.userId.slice(0, 6)}`,
      notes: {
        type: "plan_upgrade",
        fromPlan: currentPlan.name,
        toPlan: newPlan.name,
      },
    });

    const payment = new Payment({
      userId: subscription.userId,
      planId: newPlan.id as string,
      planName: newPlan.name,
      amount: payableAmount,
      currency: newPlan.currency,
      status: "pending",
      method: "Razorpay Online",
      razorpayOrderId: order.id,
      billingSnapshot: {
        userName: user.name,
        userEmail: user.email,
      },
    });

    await this._paymentRepo.create(payment);

    return {
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: ENV.PAYMENTS.RAZORPAY_ID!,
    };
  }

  // =========================
  // UPGRADE CHECK
  // =========================
  private isUpgrade(currentPlan: Plan, newPlan: Plan): boolean {
    return (
      newPlan.finalAmount > currentPlan.finalAmount ||
      newPlan.maxProjects > currentPlan.maxProjects ||
      newPlan.maxMembersPerProject > currentPlan.maxMembersPerProject
    );
  }
}
