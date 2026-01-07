import crypto from "crypto";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { UserSubscription } from "@/domain/entities/billing/UserSubscription";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { ENV } from "@/config/env.config";
import {
  CapturePaymentInput,
  CapturePaymentOutput,
  ICapturePaymentUseCase,
} from "@/application/ports/use-cases/upgradetopremium/ICapturePaymentUseCase";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { NotFoundError } from "@/application/error/AppError";
import { Payment } from "@/domain/entities/billing/Payment";

@injectable()
export class CapturePaymentUseCase implements ICapturePaymentUseCase {
  constructor(
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.PaymentRepository) private paymentRepo: IPaymentRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
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
    const subscription = await this.subscriptionRepo.findByRazorpayOrderId(
      razorpayOrderId
    );
    console.log("subscription: ", subscription);
    if (!subscription || subscription.status !== "pending") {
      return {
        success: false,
        message: "Invalid or already processed order",
      };
    }
    //Getting the user for snapshot
    const user = await this.userRepo.findById(subscription.userId);
    if (!user) throw new NotFoundError("User");

    const invoiceNumber = await this.generateInvoiceNumber();

    const payment = new Payment({
      userId: subscription.userId,
      planId: subscription.planType,
      amount: subscription.amount,
      currency: subscription.currency,
      status: "captured",
      method: "Razorpay Online",
      razorpayOrderId,
      razorpayPaymentId,
      invoiceNumber,
      billingSnapshot: {
        userName: user.name,
        userEmail: user.email,
      },
    });

    await this.paymentRepo.create(payment);

    //  Activate the subscription instantly
    const activated = new UserSubscription({
      ...subscription.toJSON(),
      status: "active",
      razorpayPaymentId: razorpayPaymentId,
      updatedAt: new Date(),
    });

    activated.setId(subscription.id!);

    await this.subscriptionRepo.update(activated);

    return {
      success: true,
      message: "Payment successful! Subscription activated.",
    };
  }
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.paymentRepo.countAll();
    const sequence = (count + 1).toString().padStart(4, "0");
    return `INV-${year}-${sequence}`;
  }
}
