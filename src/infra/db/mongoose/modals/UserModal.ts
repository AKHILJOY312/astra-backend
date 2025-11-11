import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar_url: { type: String },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },

  { timestamps: true }
);

export default mongoose.model("User", userSchema);
