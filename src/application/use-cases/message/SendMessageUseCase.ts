import { SendMessageInput } from "@/application/dto/message/messageDtos";
import { BadRequestError } from "@/application/error/AppError";
import { IAttachmentRepository } from "@/application/ports/repositories/IAttachmentRepository";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { TYPES } from "@/config/di/types";
import { Attachment } from "@/domain/entities/message/Attachment";
import { Message } from "@/domain/entities/message/Message";
import { logger } from "@/infra/logger/logger";
import { inject, injectable } from "inversify";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private messageRepo: IMessageRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AttachmentRepository)
    private attachmentRepo: IAttachmentRepository
  ) {}

  async execute(input: SendMessageInput): Promise<Message> {
    logger.debug("input from the send message", input);
    const isMember = await this.membershipRepo.findByProjectAndUser(
      input.projectId,
      input.senderId
    );
    if (!isMember) {
      throw new BadRequestError("User is not a member of the project");
    }

    const senderDetails = await this.userRepo.findById(input.senderId);
    if (!senderDetails) {
      throw new BadRequestError("Sender user not found");
    }
    const now = new Date().toISOString();
    const messageProps = {
      id: "",
      channelId: input.channelId,
      senderId: input.senderId,
      text: input.text,
      senderName: senderDetails.name,
      hasAttachments: input.attachments ? true : false,
      hasReplies: false,
      createdAt: now,
      updatedAt: now,
    };
    const message = new Message(messageProps);
    const savedMessage = await this.messageRepo.create(message);
    console.log("savedMessage", savedMessage);
    if (input.attachments) {
      const attachmentEntities = input.attachments.map(
        (att) =>
          new Attachment({
            id: "", // or let mongoose generate _id
            messageId: savedMessage.id,
            uploadedBy: input.senderId,
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            fileUrl: att.fileUrl,
            thumbnailUrl: att.thumbnailUrl,
            uploadedAt: now,
          })
      );
      console.log("attachmentEntities", attachmentEntities);
      await this.attachmentRepo.createMany(attachmentEntities);
    }
    return message;
  }
}
