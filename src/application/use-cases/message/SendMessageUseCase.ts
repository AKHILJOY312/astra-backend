import { IMessageRepository } from "@/application/repositories/IMessageRepository";
import { IProjectMembershipRepository } from "@/application/repositories/IProjectMembershipRepository";
import { IUserRepository } from "@/application/repositories/IUserRepository";
import { Message } from "@/domain/entities/message/Message";
import { send } from "process";
import { v4 as uuidv4 } from "uuid";
export class SendMessageUseCase {
  constructor(
    private messageRepo: IMessageRepository,
    private membershipRepo: IProjectMembershipRepository,
    private userRepo: IUserRepository
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
