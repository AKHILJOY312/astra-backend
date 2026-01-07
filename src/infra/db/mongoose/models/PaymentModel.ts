import mongoose, { Schema, Document } from "mongoose";

export interface PaymentDoc extends Document {
  userId: mongoose.Types.ObjectId;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  invoiceNumber: string;
  billingSnapshot: {
    userName: string;
    userEmail: string;
  };
  createdAt: Date;
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    planId: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["pending", "captured", "failed"],
      default: "pending",
    },
    method: { type: String, required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
    billingSnapshot: {
      userName: { type: String, required: true },
      userEmail: { type: String, required: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const PaymentModel = mongoose.model<PaymentDoc>(
  "Payment",
  paymentSchema
);
