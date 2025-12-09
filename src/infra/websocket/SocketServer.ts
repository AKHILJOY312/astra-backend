import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Server as HttpServer } from "http";
import { sendMessageUC } from "@/config/container";

export function createSocketServer(httpServer: HttpServer) {
  //console.log("🚀 INITIALIZING SOCKET SERVER...");

  const io = new Server(httpServer, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
  });

  //console.log(" Socket.io instance created");

  /**
   * AUTH MIDDLEWARE WITH FULL DEBUG LOGS
   */
  io.use((socket, next) => {
    //console.log("========================================");
    //console.log("📩 RAW HANDSHAKE:", socket.handshake);
    //console.log("📩 HANDSHAKE AUTH:", socket.handshake.auth);

    const token = socket.handshake.auth?.token;

    if (!token) {
      //console.log("❌ NO TOKEN RECEIVED IN handshake.auth.token");
      return next(new Error("No token provided"));
    }

    //console.log("🔑 TOKEN FROM CLIENT:", token);

    try {
      const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
      //console.log("✅ TOKEN VERIFIED:", user);

      // Attach user to socket
      socket.data.user = user;
      next();
    } catch (err: any) {
      //console.log("❌ TOKEN VERIFICATION FAILED:", err.message);
      return next(new Error("Invalid Token"));
    }
  });

  /**
   * LOW-LEVEL SOCKET CONNECTION ERRORS
   */
  io.engine.on("connection_error", (err) => {
    //console.log("🔥🔥 ENGINE CONNECTION ERROR");
    //console.log("Message:", err.message);
    //console.log("Code:", err.code);
    //console.log("Context:", err.context);
    //console.log("Request Headers:", err.req?.headers);
  });

  /**
   * HIGH-LEVEL SOCKET CONNECTION
   */
  io.on("connection", (socket) => {
    //console.log("🎉 USER CONNECTED");
    //console.log("🔌 SOCKET ID:", socket.id);
    //console.log("👤 USER DATA:", socket.data.user);

    /**
     * JOIN CHANNEL
     */
    socket.on("channel:join", (channelId: string) => {
      socket.join(channelId);
      //console.log(`📥 User ${socket.data.user.id} joined channel ${channelId}`);
    });

    /**
     * LEAVE CHANNEL
     */
    socket.on("channel:leave", (channelId: string) => {
      socket.leave(channelId);
      //console.log(`📤 User ${socket.data.user.id} left channel ${channelId}`);
    });

    /**
     * SEND MESSAGE
     */
    socket.on(
      "message:send",
      async (payload: {
        channelId: string;
        projectId: string;
        text: string;
      }) => {
        //console.log("💬 RECEIVED MESSAGE PAYLOAD:", payload);

        try {
          const msg = await sendMessageUC.execute({
            ...payload,
            senderId: socket.data.user.id,
          });

          //console.log("📢 EMITTING NEW MESSAGE:", msg);

          io.to(payload.channelId).emit("message:new", msg);
        } catch (err: any) {
          //console.log("❌ ERROR WHILE SENDING MESSAGE:", err.message);
          socket.emit("message:error", err.message);
        }
      }
    );

    /**
     * DISCONNECT LOG
     */
    socket.on("disconnect", (reason) => {
      //console.log(`⚡ User disconnected: ${socket.id} - Reason: ${reason}`);
    });
  });

  return io;
}
