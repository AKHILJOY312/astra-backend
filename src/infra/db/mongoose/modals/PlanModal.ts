import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR", "USD", "EUR"],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    maxProjects: {
      type: Number,
      default: 0,
    },
    maxStorage: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true, // generates camelCase: createdAt, updatedAt
  }
);

export default mongoose.model("Plan", planSchema);
