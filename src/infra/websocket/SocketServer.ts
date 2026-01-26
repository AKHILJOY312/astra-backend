// src/infra/web/socket/socketServer.ts
import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { Container } from "inversify";

// import { SendMessageUseCase } from "@/application/use-cases/message/SendMessageUseCase";
import { TYPES } from "@/config/di/types";
import { AuthenticatedSocket } from "./handlers/BaseSocketHandler";
import { MessageHandler } from "./handlers/MessageHandler";
import { ChannelHandler } from "./handlers/ChannelHandler";
import { JwtPayload } from "./types/type";
import { ENV } from "@/config/env.config";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";

const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    return next(new Error("No token provided"));
  }

  try {
    const payload = jwt.verify(token, ENV.JWT.ACCESS_SECRET!) as JwtPayload;
    (socket as AuthenticatedSocket).data.user = payload;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
};

export function createSocketServer(
  httpServer: HttpServer,
  container: Container,
) {
  const io = new Server(httpServer, {
    cors: {
      origin: ENV.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.data.user.id;
    console.log(`User connected: ${userId} | Socket: ${socket.id}`);

    // Resolve use cases once per connection
    const sendMessageUC = container.get<ISendMessageUseCase>(
      TYPES.SendMessageUseCase,
    );

    // Initialize handlers
    new ChannelHandler(socket).handle();
    new MessageHandler(socket, sendMessageUC, io).handle();

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${userId} | Reason: ${reason}`);
    });
  });

  return io;
}
