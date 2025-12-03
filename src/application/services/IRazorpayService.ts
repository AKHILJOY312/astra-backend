// src/core/services/payment/IRazorpayService.ts
export interface RazorpayOrderInput {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

// Match exactly what Razorpay SDK returns
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export interface IRazorpayService {
  createOrder(input: RazorpayOrderInput): Promise<RazorpayOrderResponse>;
  verifyPaymentSignature(params: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): boolean;
}
