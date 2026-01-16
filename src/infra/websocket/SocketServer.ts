// import { Server } from "socket.io";
// import jwt from "jsonwebtoken";
// import { Server as HttpServer } from "http";
// import { Container } from "inversify";
// import { SendMessageUseCase } from "@/application/use-cases/message/SendMessageUseCase";
// import { TYPES } from "@/config/types";

// export function createSocketServer(
//   httpServer: HttpServer,
//   container: Container
// ) {
//   //console.log(" INITIALIZING SOCKET SERVER...");

//   const io = new Server(httpServer, {
//     cors: { origin: "*" },
//     transports: ["websocket", "polling"],
//   });

//   //console.log(" Socket.io instance created");
//   const sendMessageUC = container.get<SendMessageUseCase>(
//     TYPES.SendMessageUseCase
//   );
//   /**
//    * AUTH MIDDLEWARE WITH FULL DEBUG LOGS
//    */
//   io.use((socket, next) => {
//     //console.log("========================================");
//     //console.log(" RAW HANDSHAKE:", socket.handshake);
//     //console.log(" HANDSHAKE AUTH:", socket.handshake.auth);

//     const token = socket.handshake.auth?.token;

//     if (!token) {
//       //console.log(" NO TOKEN RECEIVED IN handshake.auth.token");
//       return next(new Error("No token provided"));
//     }

//     //console.log(" TOKEN FROM CLIENT:", token);

//     try {
//       const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
//       //console.log(" TOKEN VERIFIED:", user);

//       // Attach user to socket
//       socket.data.user = user;
//       next();
//     } catch (err: any) {
//       //console.log(" TOKEN VERIFICATION FAILED:", err.message);
//       return next(new Error("Invalid Token"));
//     }
//   });

//   /**
//    * LOW-LEVEL SOCKET CONNECTION ERRORS
//    */
//   // io.engine.on("connection_error", (err) => {
//   //   //console.log(" ENGINE CONNECTION ERROR");
//   //   //console.log("Message:", err.message);
//   //   //console.log("Code:", err.code);
//   //   //console.log("Context:", err.context);
//   //   //console.log("Request Headers:", err.req?.headers);
//   // });

//   /**
//    * HIGH-LEVEL SOCKET CONNECTION
//    */
//   io.on("connection", (socket) => {
//     //console.log(" USER CONNECTED");
//     //console.log(" SOCKET ID:", socket.id);
//     //console.log(" USER DATA:", socket.data.user);

//     /**
//      * JOIN CHANNEL
//      */
//     socket.on("channel:join", (channelId: string) => {
//       socket.join(channelId);
//       //console.log(` User ${socket.data.user.id} joined channel ${channelId}`);
//     });

//     /**
//      * LEAVE CHANNEL
//      */
//     socket.on("channel:leave", (channelId: string) => {
//       socket.leave(channelId);
//       //console.log(` User ${socket.data.user.id} left channel ${channelId}`);
//     });

//     /**
//      * SEND MESSAGE
//      */
//     socket.on(
//       "message:send",
//       async (payload: {
//         channelId: string;
//         projectId: string;
//         text: string;
//       }) => {
//         //console.log(" RECEIVED MESSAGE PAYLOAD:", payload);

//         try {
//           const msg = await sendMessageUC.execute({
//             ...payload,
//             senderId: socket.data.user.id,
//           });

//           //console.log(" EMITTING NEW MESSAGE:", msg);

//           io.to(payload.channelId).emit("message:new", msg);
//         } catch (err: any) {
//           //console.log(" ERROR WHILE SENDING MESSAGE:", err.message);
//           socket.emit("message:error", err.message);
//         }
//       }
//     );

//     /**
//      * DISCONNECT LOG
//      */
//     socket.on("disconnect", (reason) => {
//       console.log(` User disconnected: ${socket.id} - Reason: ${reason}`);
//     });
//   });

//   return io;
// }

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
  container: Container
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
      TYPES.SendMessageUseCase
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
