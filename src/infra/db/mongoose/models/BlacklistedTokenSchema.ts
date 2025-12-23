import mongoose from "mongoose";

const BlacklistedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true, // prevents duplicates
      index: true, // fast lookup
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB auto-delete when expired!
    },
  },
  {
    timestamps: true,
  }
);

// BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedTokenModel = mongoose.model(
  "BlacklistedToken",
  BlacklistedTokenSchema
);
