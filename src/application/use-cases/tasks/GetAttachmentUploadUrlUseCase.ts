import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";

import { UnauthorizedError } from "@/application/error/AppError";
import { PresignedUrlResponseDTO } from "@/application/dto/task/taskDto";
import { randomUUID } from "crypto";
import { IGetAttachmentUploadUrlUseCase } from "@/application/ports/use-cases/task/interfaces";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";
import { ENV } from "@/config/env.config";

@injectable()
export class GetAttachmentUploadUrlUseCase implements IGetAttachmentUploadUrlUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository,

    @inject(TYPES.FileUploadService)
    private fileUploadService: IFileUploadService,
  ) {}

  async execute(
    projectId: string,
    fileName: string,
    fileType: string,
    requesterId: string,
  ): Promise<PresignedUrlResponseDTO> {
    // 1. Must be project manager
    const membership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      requesterId,
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only managers can upload task attachments");
    }

    // 2. Generate deterministic file key
    const fileKey = `projects/${projectId}/tasks/${randomUUID()}-${fileName}`;

    // 3. Generate upload URL via shared upload service
    const { uploadUrl } = await this.fileUploadService.generateFileUploadUrl({
      key: fileKey,
      contentType: fileType,
      metadata: {
        projectId,
        uploadedBy: requesterId,
        context: "task-attachment",
      },
    });
    const permanentUrl = `https://${ENV.AWS.S3_BUCKET}.s3.${ENV.AWS.REGION}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey: permanentUrl,
    };
  }
}
