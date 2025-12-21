// src/infrastructure/services/payment/RazorpayService.ts
import Razorpay from "razorpay";
import {
  IRazorpayService,
  RazorpayOrderInput,
  RazorpayOrderResponse,
} from "@/application/ports/services/IRazorpayService";
import crypto from "crypto";
import { ENV } from "@/config/env.config";

export class RazorpayService implements IRazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: ENV.PAYMENTS.RAZORPAY_ID!,
      key_secret: ENV.PAYMENTS.RAZORPAY_SECRET!,
    });
  }

  async createOrder(input: RazorpayOrderInput): Promise<RazorpayOrderResponse> {
    const order = await this.razorpay.orders.create({
      ...input,
      amount: input.amount,
    });

    return order as RazorpayOrderResponse;
  }

  verifyPaymentSignature(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): boolean {
    const text = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac("sha256", ENV.PAYMENTS.RAZORPAY_SECRET!)
      .update(text)
      .digest("hex");

    return generatedSignature === params.razorpay_signature;
  }
}
