export interface IFileUploadService {
  generateProfileImageUpload(
    userId: string,
    fileType: string
  ): Promise<{ uploadUrl: string; fileKey: string }>;
  generateProfileImageViewUrl(fileKey: string): Promise<string>;
}
