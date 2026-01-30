// src/interfaces/http/controllers/channel/ChannelController.ts
import { Request, Response } from "express";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { BadRequestError, ValidationError } from "@/application/error/AppError";
import { CHANNEL_MESSAGES } from "@/interface-adapters/http/constants/messages";
import {
  CreateChannelSchema,
  EditChannelSchema,
} from "@/interface-adapters/http/validators/channelValidators";
import { ICreateChannelUseCase } from "@/application/ports/use-cases/channel/ICreateChannelUseCase";
import { IEditChannelUseCase } from "@/application/ports/use-cases/channel/IEditChannelUseCase";
import { IDeleteChannelUseCase } from "@/application/ports/use-cases/channel/IDeleteChannelUseCase";
import { IListChannelsForUserUseCase } from "@/application/ports/use-cases/channel/IListChannelsForUserUseCase";

@injectable()
export class ChannelController {
  constructor(
    @inject(TYPES.CreateChannelUseCase)
    private _createChannelUC: ICreateChannelUseCase,
    @inject(TYPES.EditChannelUseCase)
    private _editChannelUC: IEditChannelUseCase,
    @inject(TYPES.DeleteChannelUseCase)
    private _deleteChannelUC: IDeleteChannelUseCase,
    @inject(TYPES.ListChannelsForUserUseCase)
    private _listChannelsForUserUC: IListChannelsForUserUseCase,
  ) {}

  // ---------------------------------------------------
  // CREATE CHANNEL
  // ---------------------------------------------------
  createChannel = async (req: Request, res: Response) => {
    const result = CreateChannelSchema.safeParse({
      ...req.body,
    });
    if (!result.success) {
      throw new ValidationError(CHANNEL_MESSAGES.WRONG_DATA);
    }
    const createdBy = req.user!.id;
    const { channel } = await this._createChannelUC.execute({
      projectId: req.params.projectId,
      ...result.data,
      createdBy,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: channel,
    });
  };

  // ---------------------------------------------------
  // EDIT CHANNEL
  // ---------------------------------------------------
  editChannel = async (req: Request, res: Response) => {
    const result = EditChannelSchema.safeParse({
      ...req.body,
      channelId: req.params.channelId,
      userId: req.user?.id,
    });
    if (!result.success) {
      throw new BadRequestError(CHANNEL_MESSAGES.WRONG_DATA);
    }
    const data = await this._editChannelUC.execute({
      ...result.data,
    });

    return res.json({ success: true, data: data });
  };

  // ---------------------------------------------------
  // DELETE CHANNEL
  // ---------------------------------------------------
  deleteChannel = async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const deleted = await this._deleteChannelUC.execute(
      channelId,
      req.user!.id,
    );
    return res.json({ success: true, data: deleted });
  };

  // ---------------------------------------------------
  // LIST CHANNELS VISIBLE TO USER
  // ---------------------------------------------------
  listProjectChannelsBasedOnRole = async (req: Request, res: Response) => {
    const { projectId } = req.params;
    const channels = await this._listChannelsForUserUC.execute(
      projectId,
      req.user!.id,
    );

    return res.json({
      success: true,
      data: channels.map((c) => c.toJSON()),
    });
  };
}
