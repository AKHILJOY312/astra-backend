export interface MeetingAccessInput {
  meetingId: string;
  userId: string;
  userName: string;
}

export interface MeetingAccessCredentials {
  token: string;
  serviceUrl: string;
}

export interface IMeetingService {
  /**
   * Generates secure credentials/token to join a specific media session
   */
  generateAccessCredentials(
    input: MeetingAccessInput,
  ): Promise<MeetingAccessCredentials>;
}
