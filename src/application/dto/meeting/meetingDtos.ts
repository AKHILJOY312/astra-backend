////=================================================
//Create meeting
//=================================================

import { MeetingStatus } from "@/domain/entities/meeting/Meeting";

export interface CreateMeetingDTO {
  createdBy?: string | null;
}

export interface CreateMeetingResultDTO {
  meeting: {
    id: string;
    code: string;
    status: MeetingStatus;
    maxParticipants: number;
    createAt?: Date;
  };
}

//=================================================
//joinMeetingUseCase
//=================================================
export interface JoinMeetingDTO {
  code: string;
  socketId: string;
  userId?: string;
}

export interface JoinMeetingResultDTO {
  meetingId: string;
  participants: {
    socketId?: string;
    userId?: string;
    joinedAt: Date;
    leftAt?: Date;
  }[];
}

//=================================================
//Leave the meeting
//=================================================

export interface LeaveMeetingDTO {
  meetingId: string;
  socketId: string;
}

export interface LeaveMeetingResultDTO {
  meetingId: string;
  participants: {
    socketId?: string;
    userId?: string;
    joinedAt: Date;
    leftAt?: Date;
  }[];
}

export interface GetMeetingTokenRequestDTO {
  code: string;
  userId: string;
  userName: string;
}

export interface GetMeetingTokenResponseDTO {
  meetingId: string;
  token: string;
  serviceUrl: string;
}
