// application/use-cases/message/GenerateUploadUrlUseCase.ts

import { BadRequestError } from "@/application/error/AppError";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";
import {
  GenerateUploadUrlInput,
  GenerateUploadUrlOutput,
  IGenerateUploadUrlUseCase,
} from "@/application/ports/use-cases/message/IGenerateUploadUrlUseCase";
import { TYPES } from "@/config/di/types";
import { ENV } from "@/config/env.config";
import { inject, injectable } from "inversify";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class GenerateUploadUrlUseCase implements IGenerateUploadUrlUseCase {
  constructor(
    @inject(TYPES.ProjectMembershipRepository)
    private _membershipRepo: IProjectMembershipRepository,
    @inject(TYPES.FileUploadService)
    private _fileUploadSvc: IFileUploadService, // ← we'll extend it
  ) {}

  async execute(
    input: GenerateUploadUrlInput,
  ): Promise<GenerateUploadUrlOutput> {
    // Security check: is user member?
    const membership = await this._membershipRepo.findByProjectAndUser(
      input.projectId,
      input.senderId,
    );
    if (!membership) {
      throw new BadRequestError("User is not a member of this project");
    }

    // Size limit (server-side double-check)
    if (input.fileSize > 50 * 1024 * 1024) {
      throw new BadRequestError("File size exceeds 50MB limit");
    }

    // You can add more mime type validation here if needed
    const allowedPrefixes = [
      "image/",
      "video/",
      "application/pdf",
      "text/",
      "application/vnd",
    ];
    const isAllowed = allowedPrefixes.some((prefix) =>
      input.mimeType.startsWith(prefix),
    );
    if (!isAllowed) {
      throw new BadRequestError("Unsupported file type");
    }

    // Generate unique key
    const extension = input.fileName.split(".").pop() || "bin";
    const safeName = `${Date.now()}-${uuidv4().slice(0, 8)}.${extension}`;
    const key = `chat-files/${input.channelId}/${input.senderId}/${safeName}`;

    // Use extended file upload service
    const { uploadUrl } = await this._fileUploadSvc.generateFileUploadUrl({
      key,
      contentType: input.mimeType,
      // optional: ACL, Metadata...
    });

    const permanentUrl = `https://${ENV.AWS.S3_BUCKET}.s3.${ENV.AWS.REGION}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      key,
      permanentUrl,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }
}
