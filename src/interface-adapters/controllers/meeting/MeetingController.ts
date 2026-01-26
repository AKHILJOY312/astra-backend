// src/interface-adapters/http/controllers/meeting/MeetingController.ts

import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import {
  CreateMeetingSchema,
  // JoinMeetingSchema,
  LeaveMeetingSchema,
} from "@/interface-adapters/http/validators/meetingValidators";
import { BadRequestError, ValidationError } from "@/application/error/AppError";
import {
  ICreateMeetingUseCase,
  IJoinMeetingUseCase,
  ILeaveMeetingUseCase,
} from "@/application/ports/use-cases/meeting";

@injectable()
export class MeetingController {
  constructor(
    @inject(TYPES.CreateMeetingUseCase)
    private createMeetingUC: ICreateMeetingUseCase,

    @inject(TYPES.JoinMeetingUseCase)
    private joinMeetingUC: IJoinMeetingUseCase,

    @inject(TYPES.LeaveMeetingUseCase)
    private leaveMeetingUC: ILeaveMeetingUseCase,
  ) {}

  // ---------------------------------------------------
  // CREATE MEETING
  // POST /api/meetings
  // ---------------------------------------------------
  createMeeting = async (req: Request, res: Response) => {
    const result = CreateMeetingSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid meeting data");
    }

    const { meeting } = await this.createMeetingUC.execute({
      ...result.data,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: meeting,
    });
  };

  // ---------------------------------------------------
  // VALIDATE / JOIN MEETING
  // GET /api/meetings/:code
  // ---------------------------------------------------
  validateMeeting = async (req: Request, res: Response) => {
    const code = req.params.code;

    if (!code || code.length !== 8) {
      throw new BadRequestError("Invalid meeting code");
    }

    const { participants } = await this.joinMeetingUC.execute({
      code,
      socketId: "http-preview", // placeholder (real socket join later)
    });

    return res.json({
      success: true,
      data: {
        code,
        participantsCount: participants.length,
      },
    });
  };

  // ---------------------------------------------------
  // LEAVE MEETING
  // POST /api/meetings/leave
  // ---------------------------------------------------
  leaveMeeting = async (req: Request, res: Response) => {
    const result = LeaveMeetingSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid leave request");
    }

    const data = await this.leaveMeetingUC.execute(result.data);

    return res.json({
      success: true,
      data,
    });
  };
}
