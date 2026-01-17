export interface IFileUploadService {
  generateProfileImageUpload(
    userId: string,
    fileType: string
  ): Promise<{ uploadUrl: string; fileKey: string }>;
  generateProfileImageViewUrl(fileKey: string): Promise<string>;
  generateChatFileUploadUrl(input: {
    key: string;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<{ uploadUrl: string }>;
  generateChatFileAccessUrl(input: {
    key: string;
    contentType: string;
    disposition?: "view" | "download";
  }): Promise<{ url: string; expiresAt: string }>;
}
