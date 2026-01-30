import mongoose from "mongoose";
import { ENV } from "./env.config";
import { logger } from "@/infra/logger/logger";

const MONGO_URI = ENV.DATABASE.MONGO_URI || "mongodb://127.0.0.1:27017/astra";

export const connectDB = async (): Promise<void> => {
  logger.info("Connecting to MongoDB");

  try {
    await mongoose.connect(MONGO_URI);
    logger.info("MongoDB connected successfully", {
      uri: MONGO_URI.replace(/\/\/.*@/, "//****@"), // optional redaction
    });
  } catch (error) {
    logger.error("MongoDB connection failed", {
      error: error instanceof Error ? error.message : error,
    });
    process.exit(1);
  }
};
