import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import routes from "@/infra/web/express/routes/index";
import { connectDB } from "@/config/database";
import { setupGoogleStrategy } from "../passport/googleStrategy";
import passport from "passport";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { createSocketServer } from "../websocket/SocketServer";
import { container } from "@/config/di/container";
import { globalErrorHandler } from "./express/middleware/globalErrorHandler";
import { logger, morganMiddleware } from "../logger/logger";
import { ENV } from "@/config/env.config";

const app = express();
const server = http.createServer(app);

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(morganMiddleware);

setupGoogleStrategy();

app.use(passport.initialize());
// Routes

app.use("/api", routes);

// WebSocket

createSocketServer(server, container);

app.use(globalErrorHandler);

//  Catch-all route for undefined endpoints
app.all("*", (req, res) => {
  res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

const PORT = ENV.PORT;
server.listen(PORT, () => {
  logger.info(`Astra Backend running on http://localhost:${PORT}`);
});
