// src/infrastructure/persistence/mongoose/models/PlanModel.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { Plan, PlanProps } from "@/domain/entities/billing/Plan";

export interface PlanDoc extends Document {
  _id: Types.ObjectId;
  id: string;
  name: string;
  description: string;
  price: number;
  finalAmount: number;
  currency: string;
  billingCycle: "monthly" | "yearly";
  features: string[];
  maxProjects: number;
  maxMembersPerProject: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const planSchema = new Schema<PlanDoc>(
  {
    id: { type: String, required: true, unique: true }, // e.g., "premium_monthly"
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["USD", "INR", "EUR"] },
    billingCycle: { type: String, enum: ["monthly", "yearly"], required: true },
    features: { type: [String], default: [] },
    maxProjects: { type: Number, required: true, min: 0 },
    maxMembersPerProject: { type: Number, required: true, min: 0, default: 5 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const PlanModel = mongoose.model<PlanDoc>("Plan", planSchema);

// Mapper
export const toPlanEntity = (doc: PlanDoc): Plan => {
  const props: PlanProps = {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    price: doc.price,
    finalAmount: doc.finalAmount,
    currency: doc.currency,
    billingCycle: doc.billingCycle,
    features: doc.features,
    maxProjects: doc.maxProjects,
    maxMembersPerProject: doc.maxMembersPerProject,
    isActive: doc.isActive,
    isDeleted: doc.isDeleted,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return new Plan(props);
};
