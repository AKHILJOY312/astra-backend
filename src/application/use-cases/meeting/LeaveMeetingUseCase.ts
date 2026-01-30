// src/application/use-cases/meeting/LeaveMeetingUseCase.ts

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IMeetingRepository } from "@/application/ports/repositories/IMeetingRepository";
import {
  LeaveMeetingDTO,
  LeaveMeetingResultDTO,
} from "@/application/dto/meeting/meetingDtos";
import { BadRequestError } from "@/application/error/AppError";
import { ILeaveMeetingUseCase } from "@/application/ports/use-cases/meeting";

@injectable()
export class LeaveMeetingUseCase implements ILeaveMeetingUseCase {
  constructor(
    @inject(TYPES.MeetingRepository)
    private _meetingRepo: IMeetingRepository,
  ) {}

  async execute(input: LeaveMeetingDTO): Promise<LeaveMeetingResultDTO> {
    const meeting = await this._meetingRepo.findActiveByCode(input.meetingId);

    if (!meeting) {
      throw new BadRequestError("Meeting not found or already ended");
    }

    meeting.removeParticipant(input.socketId);

    const updated = await this._meetingRepo.update(meeting);
    if (!updated) {
      throw new BadRequestError(" not updated the meeting");
    }
    return {
      meetingId: updated.id!,
      participants: updated.participants,
    };
  }
}
