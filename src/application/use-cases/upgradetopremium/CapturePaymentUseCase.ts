import crypto from "crypto";
import { IUserSubscriptionRepository } from "@/application/repositories/IUserSubscriptionRepository";
import { UserSubscription } from "@/domain/entities/billing/UserSubscription";

export interface CapturePaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface CapturePaymentOutput {
  success: boolean;
  message: string;
}

export class CapturePaymentUseCase {
  constructor(private subscriptionRepo: IUserSubscriptionRepository) {}

  async execute(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    // 1️⃣ Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
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
