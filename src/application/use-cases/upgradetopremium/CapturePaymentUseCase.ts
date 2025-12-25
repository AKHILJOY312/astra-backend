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

@injectable()
export class CapturePaymentUseCase implements ICapturePaymentUseCase {
  constructor(
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository
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
}
