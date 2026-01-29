import mongoose, { Model, Schema, Types } from "mongoose";

export interface IUserDocument extends Document {
  _id: Types.ObjectId; // Explicitly define _id to solve Error 2339
  name: string;
  email: string;
  password: string;
  avatarUrl?: string;
  about?: string;
  phone?: string;
  link?: string;
  isAdmin: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  securityStamp: string;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatarUrl: { type: String },
    about: { type: String },
    phone: { type: String },
    link: { type: String },
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

  { timestamps: true },
);

userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
// For a combined search field:
userSchema.index({ name: 1, email: 1 });

const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
  "User",
  userSchema,
);
export default UserModel;
