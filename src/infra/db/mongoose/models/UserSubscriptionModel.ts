// src/infrastructure/persistence/mongoose/models/UserSubscriptionModel.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  UserSubscription,
  UserSubscriptionProps,
  SubscriptionStatus,
} from "@/domain/entities/billing/UserSubscription";

interface SubscriptionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  planType: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate?: Date | null;
  status: SubscriptionStatus;
  razorPayOrderId: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<SubscriptionDoc>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    planType: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true, default: "USD" },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "canceled", "expired", "pending"],
      default: "active",
    },
    razorPayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String },
  },
  { timestamps: true },
);

export const UserSubscriptionModel = mongoose.model<SubscriptionDoc>(
  "UserSubscription",
  subscriptionSchema,
);

// Mapper
export const toUserSubscriptionEntity = (
  doc: SubscriptionDoc,
): UserSubscription => {
  const props: UserSubscriptionProps = {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    planType: doc.planType,
    amount: doc.amount,
    currency: doc.currency,
    startDate: doc.startDate,
    endDate: doc.endDate || undefined,
    status: doc.status,
    razorPayOrderId: doc.razorPayOrderId,
    razorpayPaymentId: doc.razorpayPaymentId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  const sub = new UserSubscription(props);
  sub.setId(doc._id.toString());
  return sub;
};
