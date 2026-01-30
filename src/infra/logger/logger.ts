// import { Request, Response, NextFunction } from "express";

// src/utils/logger.ts
import winston from "winston";
import morgan from "morgan";
// import crypto from "crypto";
import DailyRotateFile from "winston-daily-rotate-file";

import { ENV } from "@/config/env.config";

/**
 * -----------------------------
 * 1. Log Levels
 * -----------------------------
 */
const LOG_LEVEL =
  ENV.LOG_LEVEL || (ENV.NODE_ENV === "production" ? "info" : "debug");

/**
 * -----------------------------
 * 2. Formats
 * -----------------------------
 */

// Pretty console logs (development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaString =
      Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : "";
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  }),
);

// Structured JSON logs (files / production)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

/**
 * -----------------------------
 * 3. Winston Logger
 * -----------------------------
 */

const errorRotateTransport = new DailyRotateFile({
  dirname: "logs",
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
});

const combinedRotateTransport = new DailyRotateFile({
  dirname: "logs",
  filename: "combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "7d",
});

export const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: fileFormat,
  defaultMeta: {
    service: "backend-api",
    env: ENV.NODE_ENV,
  },
  transports: [errorRotateTransport, combinedRotateTransport],
  exceptionHandlers: [
    new DailyRotateFile({
      dirname: "logs",
      filename: "exceptions-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      dirname: "logs",
      filename: "rejections-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "10m",
      maxFiles: "30d",
    }),
  ],
});

// Console logging only in development
if (ENV.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

/**
 * -----------------------------
 * 4. Request ID Middleware
 * -----------------------------
 */

// export const requestIdMiddleware = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   req.requestId = crypto.randomUUID();
//   res.setHeader("X-Request-Id", req.requestId);
//   next();
// };

/**
 * -----------------------------
 * 5. Morgan → Winston (Structured)
 * -----------------------------
 */
export const morganMiddleware = morgan(
  (tokens, req, res) =>
    JSON.stringify({
      // requestId: (req as Request).requestId,
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      responseTime: `${tokens["response-time"](req, res)} ms`,
    }),
  {
    stream: {
      write: (message: string) => {
        logger.http("HTTP Request", JSON.parse(message));
      },
    },
  },
);
