import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IAttachmentRepository } from "@/application/ports/repositories/IAttachmentRepository";
import { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";
import {
  GetAttachmentDownloadUrlOutput,
  GetAttachmentsDownloadUrlInput,
  IGetAttachmentDownloadUrlUseCase,
} from "@/application/ports/use-cases/message/IGetAttachmentDownloadUrlUseCase";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class GetAttachmentDownloadUrlUseCase
  implements IGetAttachmentDownloadUrlUseCase
{
  constructor(
    @inject(TYPES.ChannelRepository) private channelRepo: IChannelRepository,
    @inject(TYPES.AttachmentRepository)
    private attachmentRepo: IAttachmentRepository,
    @inject(TYPES.MessageRepository) private messageRepo: IMessageRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private memberRepo: IProjectMembershipRepository,
    @inject(TYPES.FileUploadService) private fileUploadSrv: IFileUploadService
  ) {}

  async execute(
    input: GetAttachmentsDownloadUrlInput
  ): Promise<GetAttachmentDownloadUrlOutput> {
    const attachment = await this.attachmentRepo.findById(input.attachmentId);
    if (!attachment) {
      throw new BadRequestError("Attachment not found");
    }

    const message = await this.messageRepo.findById(attachment.messageId);

    if (!message) {
      throw new BadRequestError("Parent message is not found");
    }
    const channel = await this.channelRepo.findById(message.channelId);
    if (!channel) {
      throw new BadRequestError("Parent channel is not found");
    }

    const membership = await this.memberRepo.findByProjectAndUser(
      channel.projectId,
      input.userId
    );

    if (!membership) {
      throw new UnauthorizedError("Access denied");
    }
    const key = attachment.fileUrl.split(".amazonaws.com/")[1];
    if (!key) {
      throw new BadRequestError("Invalid attachment storage key");
    }

    return this.fileUploadSrv.generateChatFileAccessUrl({
      key,
      contentType: attachment.fileType,
      disposition: input.disposition,
    });
  }
}
