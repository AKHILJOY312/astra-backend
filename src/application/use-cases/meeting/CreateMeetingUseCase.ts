import {
  CreateMeetingDTO,
  CreateMeetingResultDTO,
} from "@/application/dto/meeting/meetingDtos";
import { IMeetingRepository } from "@/application/ports/repositories/IMeetingRepository";
import { ICreateMeetingUseCase } from "@/application/ports/use-cases/meeting";
import { TYPES } from "@/config/di/types";
import { Meeting } from "@/domain/entities/meeting/Meeting";
import { inject, injectable } from "inversify";
import { nanoid } from "nanoid";

@injectable()
export class CreateMeetingUseCase implements ICreateMeetingUseCase {
  constructor(
    @inject(TYPES.MeetingRepository) private _meetingRepo: IMeetingRepository,
  ) {}
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let exists: boolean;

    do {
      code = nanoid(8).toUpperCase();
      exists = !!(await this._meetingRepo.findByCode(code));
    } while (exists);

    return code;
  }
  async execute(input: CreateMeetingDTO): Promise<CreateMeetingResultDTO> {
    const code = await this.generateUniqueCode();

    const meeting = new Meeting({
      code,
      createdBy: input.createdBy ?? null,
      status: "active",
      maxParticipants: 6,
      participants: [],
    });

    const saved = await this._meetingRepo.create(meeting);

    return {
      meeting: {
        id: saved.id!,
        code: saved.code,
        status: saved.status,
        maxParticipants: saved.maxParticipants,
        createAt: saved.createdAt,
      },
    };
  }
}
