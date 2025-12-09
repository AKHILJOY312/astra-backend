import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar_url: { type: String },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    securityStamp: { type: String },
  },

  { timestamps: true }
);

userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
// For a combined search field:
userSchema.index({ name: 1, email: 1 });

export default mongoose.model("User", userSchema);
