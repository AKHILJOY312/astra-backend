// import { Server as SocketIOServer, Socket } from "socket.io";
// import { SendMessageUseCase } from "../../../application/use-cases/message/SendMessageUseCase";
// import { MessageRepositoryImpl } from "../../../infra/db/repositories/MessageRepositoryImpl";

// export class SocketController {
//   private io: SocketIOServer;
//   private sendMessageUseCase: SendMessageUseCase;

//   constructor(io: SocketIOServer) {
//     this.io = io;
//     this.sendMessageUseCase = new SendMessageUseCase(
//       new MessageRepositoryImpl()
//     );
//     this.setup();
//   }

//   private setup() {
//     this.io.use((socket, next) => {
//       const token = socket.handshake.auth.token;
//       // TODO: Validate JWT here
//       if (token) {
//         // Decode token to get userId
//         socket.data.userId = "user-123"; // Mock for now
//         return next();
//       }
//       next(new Error("Authentication error"));
//     });

//     this.io.on("connection", (socket: Socket) => {
//       console.log("User connected:", socket.id);

//       socket.on("send_message", async (data) => {
//         try {
//           const senderId = socket.data.userId || "anonymous";
//           const message = await this.sendMessageUseCase.execute({
//             channelId: data.channelId,
//             senderId,
//             content: data.content,
//             type: data.type || "text",
//             fileUrl: data.fileUrl,
//           });
//           this.io.to(data.channelId).emit("new_message", message);
//         } catch (err: any) {
//           socket.emit("error", { message: err.message });
//         }
//       });

//       socket.on("join_channel", (channelId) => {
//         socket.join(channelId);
//         console.log(`User ${socket.data.userId} joined channel ${channelId}`);
//       });

//       socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//       });
//     });
//   }
// }
