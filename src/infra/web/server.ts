import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import routes from "@/infra/web/express/routes/index";
import { connectDB } from "../../config/database";
import { setupGoogleStrategy } from "../passport/googleStrategy";
import passport from "passport";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { createSocketServer } from "../websocket/SocketServer";
import { container } from "@/config/container";

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
  })
);

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

setupGoogleStrategy();

app.use(passport.initialize());
// Routes
app.use((req, res, next) => {
  console.log(
    "######################################################################################################"
  );
  console.log(
    "######################################################################################################"
  );
  console.log("REQUEST URL:", req.method, req.url);
  next();
});

app.use("/api", routes);

// WebSocket

createSocketServer(server, container);

//  Catch-all route for undefined endpoints
app.all("*", (req, res) => {
  res.status(HTTP_STATUS.BAD_REQUEST).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

//  Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err.message);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  }
);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Astra Backend running on http://localhost:${PORT}`);
});
