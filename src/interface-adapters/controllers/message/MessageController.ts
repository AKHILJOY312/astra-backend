import { ListMessagesUseCase } from "@/application/use-cases/message/ListMessagesUseCase";
import { SendMessageUseCase } from "@/application/use-cases/message/SendMessageUseCase";
import { Request, Response } from "express";

export class MessageController {
  constructor(
    private sendMessageUC: SendMessageUseCase,
    private listMessagesUC: ListMessagesUseCase
  ) {}

  async listMessagesPerChannel(req: Request, res: Response) {
    const channelId = req.params.channelId;
    const cursor = req.query.cursor as string | undefined;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;

    try {
      const messages = await this.listMessagesUC.execute({
        channelId,
        cursor,
        limit,
      });
      return res
        .status(200)
        .json({ success: true, data: messages.map((msg) => msg.toJSON()) });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
  async sendMessage(req: Request, res: Response) {
    const channelId = req.params.channelId;
    const projectId = req.params.projectId;
    const senderId = req.user!.id;
    const { text, attachments } = req.body;
    try {
      const message = await this.sendMessageUC.execute({
        projectId,
        channelId,
        senderId,
        text,
        attachments,
      });
      return res.status(201).json({ success: true, data: message.toJSON() });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}
