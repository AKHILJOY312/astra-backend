// src/infrastructure/persistence/mongoose/models/UserSubscriptionModel.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  UserSubscription,
  UserSubscriptionProps,
  PlanType,
  SubscriptionStatus,
} from "../../../../domain/entities/billing/UserSubscription";

interface SubscriptionDoc extends Document {
  userId: mongoose.Types.ObjectId;
  planType: PlanType;
  amount: number;
  currency: string;
  startDate: Date;
  endDate?: Date | null;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
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
      enum: ["free", "premium", "pro"],
      default: "free",
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
    stripeSubscriptionId: { type: String },
  },
  { timestamps: true }
);

export const UserSubscriptionModel = mongoose.model<SubscriptionDoc>(
  "UserSubscription",
  subscriptionSchema
);

// Mapper
export const toUserSubscriptionEntity = (
  doc: SubscriptionDoc
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
    stripeSubscriptionId: doc.stripeSubscriptionId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  const sub = new UserSubscription(props);
  sub.setId(doc._id.toString());
  return sub;
};
