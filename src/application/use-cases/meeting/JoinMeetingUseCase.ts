import {
  JoinMeetingDTO,
  JoinMeetingResultDTO,
} from "@/application/dto/meeting/meetingDtos";
import { BadRequestError } from "@/application/error/AppError";
import { IMeetingRepository } from "@/application/ports/repositories/IMeetingRepository";
import { IJoinMeetingUseCase } from "@/application/ports/use-cases/meeting";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class JoinMeetingUseCase implements IJoinMeetingUseCase {
  constructor(
    @inject(TYPES.MeetingRepository) private _meetingRepo: IMeetingRepository,
  ) {}

  async execute(input: JoinMeetingDTO): Promise<JoinMeetingResultDTO> {
    const meeting = await this._meetingRepo.findActiveByCode(input.code);

    if (!meeting) {
      throw new BadRequestError("Meeting not found ar already ended");
    }

    meeting.addParticipants({
      socketId: input.socketId,
      userId: input.userId,
      joinedAt: new Date(),
    });

    const updated = await this._meetingRepo.update(meeting);
    if (!updated) {
      throw new BadRequestError("Not updated");
    }
    return {
      meetingId: updated.id!,
      participants: updated.participants,
    };
  }
}
