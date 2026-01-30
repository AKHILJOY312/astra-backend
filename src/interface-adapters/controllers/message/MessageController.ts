import { BadRequestError } from "@/application/error/AppError";
import { IGenerateUploadUrlUseCase } from "@/application/ports/use-cases/message/IGenerateUploadUrlUseCase";
import { IGetAttachmentDownloadUrlUseCase } from "@/application/ports/use-cases/message/IGetAttachmentDownloadUrlUseCase";
import { IListMessagesUseCase } from "@/application/ports/use-cases/message/IListMessagesUseCase";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { IGetTaskAttachmentDownloadUrlUseCase } from "@/application/ports/use-cases/task/interfaces";
import { TYPES } from "@/config/di/types";
import { HTTP_STATUS } from "@/interface-adapters/http/constants/httpStatus";
import { Request, Response } from "express";
import { inject, injectable } from "inversify";

@injectable()
export class MessageController {
  constructor(
    @inject(TYPES.SendMessageUseCase)
    private _sendMessageUC: ISendMessageUseCase,
    @inject(TYPES.ListMessagesUseCase)
    private _listMessagesUC: IListMessagesUseCase,
    @inject(TYPES.GenerateUploadUrlUseCase)
    private _generateUploadUrlUC: IGenerateUploadUrlUseCase,
    @inject(TYPES.GetAttachmentDownloadUrlUseCase)
    private _getAttachmentDownloadUrlUC: IGetAttachmentDownloadUrlUseCase,
    @inject(TYPES.GetTaskAttachmentDownloadUrlUseCase)
    private _getTaskAttachmentDownloadUrlUC: IGetTaskAttachmentDownloadUrlUseCase,
  ) {}

  listMessagesPerChannel = async (req: Request, res: Response) => {
    const channelId = req.params.channelId;
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    const messages = await this._listMessagesUC.execute({
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

    const message = await this._sendMessageUC.execute({
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
        "fileName, fileSize, and mimeType are required",
      );
    }

    if (typeof fileSize !== "number" || fileSize <= 0) {
      throw new BadRequestError("Invalid fileSize");
    }

    const result = await this._generateUploadUrlUC.execute({
      projectId,
      channelId,
      senderId,
      fileName,
      fileSize,
      mimeType,
    });

    return res.json({
      success: true,
      data: result,
    });
  };

  getAttachmentsAccessUrl = async (req: Request, res: Response) => {
    const attachmentId = req.params.attachmentId;
    const userId = req.user!.id;
    const disposition =
      req.query.disposition === "download" ? "download" : "view";

    if (!attachmentId) {
      throw new BadRequestError("attachmentId is required");
    }
    const result =
      req.query.disposition === "task"
        ? await this._getTaskAttachmentDownloadUrlUC.execute(attachmentId)
        : await this._getAttachmentDownloadUrlUC.execute({
            attachmentId,
            userId,
            disposition,
          });

    return res.json({
      success: true,
      data: result,
    });
  };
}
