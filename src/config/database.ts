import mongoose from "mongoose";
import { ENV } from "./env.config";

const MONGO_URI = ENV.DATABASE.MONGO_URI || "mongodb://127.0.0.1:27017/astra";

export const connectDB = async (): Promise<void> => {
  console.log("Connecting to MongoDB...");

  try {
    await mongoose.connect(MONGO_URI);
    console.log(" MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
