import { BadRequestError } from "@/application/error/AppError";
import { IGenerateUploadUrlUseCase } from "@/application/ports/use-cases/message/IGenerateUploadUrlUseCase";
import { IListMessagesUseCase } from "@/application/ports/use-cases/message/IListMessagesUseCase";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class MessageController {
  constructor(
    @inject(TYPES.SendMessageUseCase)
    private sendMessageUC: ISendMessageUseCase,
    @inject(TYPES.ListMessagesUseCase)
    private listMessagesUC: IListMessagesUseCase,
    @inject(TYPES.GenerateUploadUrlUseCase)
    private generateUploadUrlUC: IGenerateUploadUrlUseCase
  ) {}

  listMessagesPerChannel = async (req: Request, res: Response) => {
    const channelId = req.params.channelId;
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const messages = await this.listMessagesUC.execute({
      channelId,
      cursor,
      limit,
    });
    return res.json({
      success: true,
      data: messages.map((msg) => msg.toJSON()),
    });
  };
  sendMessage = async (req: Request, res: Response) => {
    const channelId = req.params.channelId;
    const projectId = req.params.projectId;
    const senderId = req.user!.id;
    const { text, attachments } = req.body;

    const message = await this.sendMessageUC.execute({
      projectId,
      channelId,
      senderId,
      text,
      attachments,
    });
    return res
      .status(HTTP_STATUS.CREATED)
      .json({ success: true, data: message.toJSON() });
  };

  generateUploadUrl = async (req: Request, res: Response) => {
    const { projectId, channelId } = req.params;
    const senderId = req.user!.id;
    const { fileName, fileSize, mimeType } = req.body;

    if (!fileName || !fileSize || !mimeType) {
      throw new BadRequestError(
        "fileName, fileSize, and mimeType are required"
      );
    }

    if (typeof fileSize !== "number" || fileSize <= 0) {
      throw new BadRequestError("Invalid fileSize");
    }

    const result = await this.generateUploadUrlUC.execute({
      projectId,
      channelId,
      senderId,
      fileName,
      fileSize,
      mimeType,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  };
}
