// ports/use-cases/message/IGenerateUploadUrlUseCase.ts
export interface IGenerateUploadUrlUseCase {
  execute(input: GenerateUploadUrlInput): Promise<GenerateUploadUrlOutput>;
}

export interface GenerateUploadUrlInput {
  projectId: string;
  channelId: string;
  senderId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface GenerateUploadUrlOutput {
  uploadUrl: string;
  key: string;
  permanentUrl: string; // what will be stored in DB
  expiresAt: string;
}
