import { SendMessageInput } from "@/application/dto/message/messageDtos";
import { BadRequestError } from "@/application/error/AppError";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { TYPES } from "@/config/types";
import { Message } from "@/domain/entities/message/Message";
import { inject, injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private messageRepo: IMessageRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(input: SendMessageInput): Promise<Message> {
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
      id: uuidv4(),
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
    await this.messageRepo.create(message);
    return message;
  }
}
