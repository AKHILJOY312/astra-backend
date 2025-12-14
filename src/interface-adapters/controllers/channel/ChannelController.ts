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
  async createChannel(req: Request, res: Response) {
    const schema = z.object({
      channelName: z.string().min(1),
      description: z.string().optional(),

      visibleToRoles: z.array(z.string()),

      permissionsByRole: z.record(
        z.string(),
        z.enum(["view", "message", "manager"])
      ),
    });

    const result = schema.safeParse({
      ...req.body,
    });
    if (!result.success)
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: result.error.format() });

    const createdBy = req.user!.id;

    try {
      const { channel } = await this.createChannelUC.execute({
        projectId: req.params.projectId,
        ...result.data,
        createdBy,
      });

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        data: channel.toJSON(),
      });
    } catch (err: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: err.message });
    }
  }

  // ---------------------------------------------------
  // EDIT CHANNEL
  // ---------------------------------------------------
  async editChannel(req: Request, res: Response) {
    const schema = z.object({
      channelId: z.string(),
      userId: z.string(),
      channelName: z.string().optional(),
      description: z.string().optional(),

      visibleToRoles: z.array(z.string()).optional(),

      permissionsByRole: z
        .record(z.string(), z.enum(["view", "message", "manager"]))
        .optional(),
    });

    const result = schema.safeParse({
      ...req.body,
      channelId: req.params.channelId,
      userId: req.user?.id,
    });
    if (!result.success)
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ error: result.error.format() });
    console.log("result.data: ", result.data);
    try {
      const data = await this.editChannelUC.execute({
        ...result.data,
      });
      console.log("data: ", data);
      return res.json({ success: true, data: data });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ---------------------------------------------------
  // DELETE CHANNEL
  // ---------------------------------------------------
  async deleteChannel(req: Request, res: Response) {
    try {
      const { channelId } = req.params;

      const deleted = await this.deleteChannelUC.execute(
        channelId,
        req.user!.id
      );

      return res.json({ success: true, data: deleted });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // ---------------------------------------------------
  // LIST CHANNELS VISIBLE TO USER
  // ---------------------------------------------------
  async listProjectChannelsBasedOnRole(req: Request, res: Response) {
    try {
      const { projectId } = req.params;

      const channels = await this.listChannelsForUserUC.execute(
        projectId,
        req.user!.id
      );

      return res.json({
        success: true,
        data: channels.map((c) => c.toJSON()),
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
