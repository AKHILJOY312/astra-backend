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
    this.socket.on("meeting:join", async (code: string) => {
      const userId = this.socket.data.user.id;

      const result = await this.joinMeetingUC.execute({
        code,
        socketId: this.socket.id,
        userId,
      });
      const meetingId = result.meetingId;
      this.socket.join(meetingId);
      this.io.to(meetingId).emit("meeting:user-joined", {
        userId,
        meetingId: meetingId,
      });
    });

    this.socket.on("meeting:leave", async (meetingId: string) => {
      await this.leaveMeetingUC.execute({
        meetingId,
        socketId: this.socket.id,
      });

      this.socket.leave(meetingId);
      this.io.to(meetingId).emit("meeting:user-left", {
        socketId: this.socket.id,
        meetingId,
      });
    });
  }
}
