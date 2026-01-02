export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",

  DATABASE: {
    MONGO_URI: process.env.MONGO_URI!,
  },

  JWT: {
    ACCESS_SECRET: process.env.ACCESS_TOKEN_SECRET!,
    ACCESS_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
    REFRESH_SECRET: process.env.REFRESH_TOKEN_SECRET!,
    REFRESH_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
    REFRESH_MS: process.env.REFRESH_TOKEN_EXPIRY_MS,
  },

  GOOGLE: {
    ID: process.env.GOOGLE_CLIENT_ID,
    SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK: process.env.GOOGLE_CALLBACK_URL,
  },

  PAYMENTS: {
    RAZORPAY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  MAIL: {
    USER: process.env.NODEMAILER_EMAIL,
    PASS: process.env.NODEMAILER_PASSWORD,
  },

  AWS: {
    ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    SECRET_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    REGION: process.env.AWS_REGION,
    S3_BUCKET: process.env.AWS_S3_BUCKET,
    S3_BASE_URL: process.env.AWS_S3_BASE_URL,
  },
};

// Simple validation to ensure critical keys are present
if (!ENV.JWT.ACCESS_SECRET || !ENV.DATABASE.MONGO_URI) {
  throw new Error("Missing critical environment variables in .env file");
}
