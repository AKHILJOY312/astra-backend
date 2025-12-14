import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { TYPES } from "@/config/types";
import { Message } from "@/domain/entities/message/Message";
import { inject, injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class SendMessageUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private messageRepo: IMessageRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.UserRepository) private userRepo: IUserRepository
  ) {}

  async execute(input: {
    projectId: string;
    channelId: string;
    senderId: string;
    text: string;
    attachments?: boolean;
  }): Promise<Message> {
    const isMember = await this.membershipRepo.findByProjectAndUser(
      input.projectId,
      input.senderId
    );
    if (!isMember) {
      throw new Error("User is not a member of the project");
    }
    console.log("send message use case is working ");
    const senderDetails = await this.userRepo.findById(input.senderId);
    if (!senderDetails) {
      throw new Error("Sender user not found");
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
