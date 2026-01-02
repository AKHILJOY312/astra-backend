export interface GeneratePresignedUrlDTO {
  userId: string;
  fileType: string; // e.g. "image/jpeg"
}

export interface GeneratePresignedUrlResponse {
  uploadUrl: string; // presigned PUT URL
  imageUrl: string; // final public URL after upload
}

export interface SaveProfileImageDTO {
  userId: string;
  fileKey: string;
}

export interface IUploadProfileImageUseCase {
  generatePresignedUrl(
    dto: GeneratePresignedUrlDTO
  ): Promise<{ uploadUrl: string; fileKey: string }>;
  saveImageUrl(dto: SaveProfileImageDTO): Promise<string>;
}
