import crypto from "crypto";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { ENV } from "@/config/env.config";
import {
  CapturePaymentInput,
  CapturePaymentOutput,
  ICapturePaymentUseCase,
} from "@/application/ports/use-cases/upgradetopremium/ICapturePaymentUseCase";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { NotFoundError } from "@/application/error/AppError";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { ICounterRepository } from "@/application/ports/repositories/ICounterRepository";
// import { Payment } from "@/domain/entities/billing/Payment";

@injectable()
export class CapturePaymentUseCase implements ICapturePaymentUseCase {
  constructor(
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PaymentRepository) private paymentRepo: IPaymentRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.PlanRepository) private planRepo: IPlanRepository,
    @inject(TYPES.CounterRepository) private counterRepo: ICounterRepository
  ) {}

  async execute(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    //  Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", ENV.PAYMENTS.RAZORPAY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return {
        success: false,
        message: "Invalid signature",
      };
    }

    // Find subscription by razorPayOrderId
    const payment = await this.paymentRepo.findByRazorpayOrderId(
      razorpayOrderId
    );
    if (!payment) {
      throw new NotFoundError("Payment");
    }

    //  Idempotency
    if (payment.status === "captured") {
      return {
        success: true,
        message: "Payment already captured",
      };
    }

    const invoiceNumber = await this.generateInvoiceNumber();

    payment.setRazorpayPaymentId(razorpayPaymentId);
    payment.capture(invoiceNumber);

    await this.paymentRepo.update(payment);
    //Getting the user for snapshot
    const user = await this.userRepo.findById(payment.userId);
    if (!user) throw new NotFoundError("User");
    const plan = await this.planRepo.findById(payment.planId);
    if (!plan) {
      throw new NotFoundError("Plan");
    }
    let existingSubscription = await this.subscriptionRepo.findByUserId(
      payment.userId
    );

    const now = new Date();
    const endDate = this.getNextBillingDate(plan.billingCycle);

    if (existingSubscription) {
      existingSubscription.setPlan(
        payment.planId,
        payment.amount,
        payment.currency
      );
      existingSubscription.setStatus("active");
      existingSubscription.setOrderId(payment.razorpayOrderId);
      existingSubscription.setStartDate(now);
      existingSubscription.setEndDate(endDate);
      existingSubscription.setUpdatedAt(now);

      await this.subscriptionRepo.update(existingSubscription);
    } else {
      existingSubscription = new UserSubscription({
        userId: payment.userId,
        planType: payment.planId,
        amount: payment.amount,
        currency: payment.currency,
        startDate: now,
        endDate,
        status: "active",
        razorPayOrderId: payment.razorpayOrderId,
      });
      await this.subscriptionRepo.create(existingSubscription);
    }

    return {
      success: true,
      message: "Payment captured and subscription activated",
    };
  }
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const sequence = await this.counterRepo.getNext(`invoice-${year}`);

    return `INV-${year}-${sequence}`;
  }

  private getNextBillingDate(cycle: string): Date {
    const date = new Date();
    if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
    else date.setMonth(date.getMonth() + 1);
    return date;
  }
}
