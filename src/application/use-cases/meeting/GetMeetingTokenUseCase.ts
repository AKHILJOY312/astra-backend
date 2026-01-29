import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IMeetingService } from "@/application/ports/services/IMeetingService";
import { IMeetingRepository } from "@/application/ports/repositories/IMeetingRepository";
import { NotFoundError } from "@/application/error/AppError";
import { IGetMeetingTokenUseCase } from "@/application/ports/use-cases/meeting";
import {
  GetMeetingTokenRequestDTO,
  GetMeetingTokenResponseDTO,
} from "@/application/dto/meeting/meetingDtos";

@injectable()
export class GetMeetingTokenUseCase implements IGetMeetingTokenUseCase {
  constructor(
    @inject(TYPES.MeetingRepository)
    private meetingRepo: IMeetingRepository,

    @inject(TYPES.MeetingService)
    private meetingService: IMeetingService, // Injected as interface
  ) {}

  async execute(
    input: GetMeetingTokenRequestDTO,
  ): Promise<GetMeetingTokenResponseDTO> {
    // 1. Business Logic: Does this meeting exist?
    const meeting = await this.meetingRepo.findByCode(input.code);
    if (!meeting) {
      throw new NotFoundError("Meeting not found");
    }

    // 2. Delegate to infrastructure via the Port
    const credentials = await this.meetingService.generateAccessCredentials({
      meetingId: meeting.id!,
      userId: input.userId,
      userName: input.userName,
    });

    return {
      meetingId: meeting.id!,
      ...credentials,
    };
  }
}
