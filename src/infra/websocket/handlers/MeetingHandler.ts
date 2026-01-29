import {
  IJoinMeetingUseCase,
  ILeaveMeetingUseCase,
} from "@/application/ports/use-cases/meeting";
import { AuthenticatedSocket, BaseSocketHandler } from "./BaseSocketHandler";
import { Server } from "socket.io";

export class MeetingHandler extends BaseSocketHandler {
  constructor(
    socket: AuthenticatedSocket,
    private joinMeetingUC: IJoinMeetingUseCase,
    private leaveMeetingUC: ILeaveMeetingUseCase,
    private io: Server,
  ) {
    super(socket);
  }

  handle(): void {
    console.log(
      "🧠 MeetingHandler (LiveKit Mode) initialized:",
      this.socket.id,
    );

    this.socket.on("meeting:join", async ({ code }) => {
      const userId = this.socket.data.user.id;

      try {
        const result = await this.joinMeetingUC.execute({
          code,
          socketId: this.socket.id,
          userId,
        });

        const meetingId = result.meetingId;

        // Join the Socket.io room for presence/chat
        await this.socket.join(meetingId);

        // Notify OTHERS in the room that a new participant is here
        // Note: LiveKit also has an 'onParticipantConnected' event,
        // but keeping this allows you to sync non-video state.
        this.socket.to(meetingId).emit("meeting:user-joined", {
          userId,

          socketId: this.socket.id,
          meetingId,
        });

        console.log(`✅ User ${userId} joined room ${meetingId}`);
      } catch (error) {
        console.error("❌ Failed to join meeting room:", error);
      }
    });

    // --- SIGNALING REMOVED ---
    // The "meeting:signal" listener is deleted.
    // LiveKit handles this via its own internal signaling server.

    this.socket.on("meeting:leave", async (data: any) => {
      const meetingId = typeof data === "string" ? data : data.meetingId;
      if (!meetingId) return;

      try {
        await this.leaveMeetingUC.execute({
          meetingId,
          socketId: this.socket.id,
        });

        this.socket.leave(meetingId);

        // Notify others that the user left
        this.io.to(meetingId).emit("meeting:user-left", {
          userId: this.socket.data.user.id,
          socketId: this.socket.id,
          meetingId,
        });

        console.log(`🚪 User left room: ${meetingId}`);
      } catch (error) {
        console.error("❌ Error during meeting:leave:", error);
      }
    });
  }
}
