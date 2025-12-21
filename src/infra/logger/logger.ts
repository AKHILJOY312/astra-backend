// src/utils/logger.ts
import winston from "winston";
import morgan from "morgan";
import { ENV } from "@/config/env.config";

// Custom format for console (pretty in development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// JSON format for files/production
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create Winston logger
const logger = winston.createLogger({
  level: ENV.NODE_ENV === "production" ? "info" : "debug",
  format: fileFormat,
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs with level `info` and below to `combined.log`
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

// Add console transport in development
if (ENV.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create Morgan middleware using Winston (instead of console.log)
const morganMiddleware = morgan("combined", {
  stream: {
    write: (message: string) => logger.http(message.trim()),
  },
});

export { logger, morganMiddleware };

// In controllers, use cases, services, etc.
// logger.info("User registered successfully", { userId: "123" });
// logger.warn("Deprecated endpoint used", { path: req.path });
// logger.error("Database query failed", { error: err.message, stack: err.stack });
// logger.debug("Debug data", { payload });
