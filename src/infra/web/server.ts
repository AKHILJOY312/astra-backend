import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import { Server as SocketIOServer } from "socket.io";
import AuthRoutes from "../../interface-adapters/http/routes/authRoutes";
import adminAuthRoutes from "../../interface-adapters/http/routes/admin/adminAuthRoutes";
import planRoutes from "../../interface-adapters/http/routes/admin/planRoutes";
// import { SocketController } from "../../interface-adapters/controllers/websocket/SocketController";
import { connectDB } from "../../config/database";
import { setupGoogleStrategy } from "../passport/googleStrategy";
import passport from "passport";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: "*" } });

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
  console.log("REQUEST URL:", req.method, req.url);
  next();
});

app.use("/api/auth/", AuthRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/plans", planRoutes);
// WebSocket
// new SocketController(io);

//  Catch-all route for undefined endpoints
app.all("*", (req, res) => {
  res.status(404).json({
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
    res.status(500).json({
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
