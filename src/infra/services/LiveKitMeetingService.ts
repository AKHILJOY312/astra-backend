import {
  IMeetingService,
  MeetingAccessInput,
  MeetingAccessCredentials,
} from "@/application/ports/services/IMeetingService";
import { AccessToken } from "livekit-server-sdk";
import { ENV } from "@/config/env.config";

export class LiveKitMeetingService implements IMeetingService {
  async generateAccessCredentials(
    input: MeetingAccessInput,
  ): Promise<MeetingAccessCredentials> {
    // LiveKit specific implementation
    const at = new AccessToken(ENV.LIVEKIT.API_KEY!, ENV.LIVEKIT.API_SECRET!, {
      identity: input.userId,
      name: input.userName,
    });

    at.addGrant({
      roomJoin: true,
      room: input.meetingId,
      canPublish: true,
      canSubscribe: true,
    });

    return {
      token: await at.toJwt(),
      serviceUrl: ENV.LIVEKIT.URL!,
    };
  }
}
