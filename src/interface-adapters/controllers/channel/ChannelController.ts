// src/interfaces/http/controllers/channel/ChannelController.ts
import { Request, Response } from "express";
import { z } from "zod";
import { HTTP_STATUS } from "../../http/constants/httpStatus";

import { CreateChannelUseCase } from "@/application/use-cases/channel/CreateChannelUseCase";
import { EditChannelUseCase } from "@/application/use-cases/channel/EditChannelUseCase";
import { DeleteChannelUseCase } from "@/application/use-cases/channel/DeleteChannelUseCase";
import { ListChannelsForUserUseCase } from "@/application/use-cases/channel/ListChannelsForUserUseCase";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { BadRequestError, ValidationError } from "@/application/error/AppError";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { CHANNEL_MESSAGES } from "@/interface-adapters/http/constants/messages";

const CreateChannelSchema = z.object({
  channelName: z.string().min(1),
  description: z.string().optional(),
  visibleToRoles: z.array(z.string()),
  permissionsByRole: z.record(
    z.string(),
    z.enum(["view", "message", "manager"])
  ),
});

const EditChannelSchema = z.object({
  channelId: z.string(),
  userId: z.string(),
  channelName: z.string().optional(),
  description: z.string().optional(),
  visibleToRoles: z.array(z.string()).optional(),
  permissionsByRole: z
    .record(z.string(), z.enum(["view", "message", "manager"]))
    .optional(),
});

@injectable()
export class ChannelController {
  constructor(
    @inject(TYPES.CreateChannelUseCase)
    private createChannelUC: CreateChannelUseCase,
    @inject(TYPES.EditChannelUseCase) private editChannelUC: EditChannelUseCase,
    @inject(TYPES.DeleteChannelUseCase)
    private deleteChannelUC: DeleteChannelUseCase,
    @inject(TYPES.ListChannelsForUserUseCase)
    private listChannelsForUserUC: ListChannelsForUserUseCase
  ) {}

  // ---------------------------------------------------
  // CREATE CHANNEL
  // ---------------------------------------------------
  createChannel = asyncHandler(async (req: Request, res: Response) => {
    const result = CreateChannelSchema.safeParse({
      ...req.body,
    });
    if (!result.success) {
      throw new ValidationError(CHANNEL_MESSAGES.WRONG_DATA);
    }
    const createdBy = req.user!.id;
    const { channel } = await this.createChannelUC.execute({
      projectId: req.params.projectId,
      ...result.data,
      createdBy,
    });

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: channel.toJSON(),
    });
  });

  // ---------------------------------------------------
  // EDIT CHANNEL
  // ---------------------------------------------------
  editChannel = asyncHandler(async (req: Request, res: Response) => {
    const result = EditChannelSchema.safeParse({
      ...req.body,
      channelId: req.params.channelId,
      userId: req.user?.id,
    });
    if (!result.success) {
      throw new BadRequestError(CHANNEL_MESSAGES.WRONG_DATA);
    }
    const data = await this.editChannelUC.execute({
      ...result.data,
    });

    return res.json({ success: true, data: data });
  });

  // ---------------------------------------------------
  // DELETE CHANNEL
  // ---------------------------------------------------
  deleteChannel = asyncHandler(async (req: Request, res: Response) => {
    const { channelId } = req.params;
    const deleted = await this.deleteChannelUC.execute(channelId, req.user!.id);
    return res.json({ success: true, data: deleted });
  });

  // ---------------------------------------------------
  // LIST CHANNELS VISIBLE TO USER
  // ---------------------------------------------------
  listProjectChannelsBasedOnRole = asyncHandler(
    async (req: Request, res: Response) => {
      const { projectId } = req.params;
      const channels = await this.listChannelsForUserUC.execute(
        projectId,
        req.user!.id
      );

      return res.json({
        success: true,
        data: channels.map((c) => c.toJSON()),
      });
    }
  );
}
