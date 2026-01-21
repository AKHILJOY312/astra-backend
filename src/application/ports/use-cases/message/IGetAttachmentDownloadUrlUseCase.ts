export interface GetAttachmentsDownloadUrlInput {
  attachmentId: string;
  userId: string;
  disposition: "view" | "download";
}

export interface GetAttachmentDownloadUrlOutput {
  url: string;
  expiresAt: string;
}

export interface IGetAttachmentDownloadUrlUseCase {
  execute(
    input: GetAttachmentsDownloadUrlInput,
  ): Promise<GetAttachmentDownloadUrlOutput>;
}
