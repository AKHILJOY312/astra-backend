import { ValidationError } from "@/application/error/AppError";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";
import { ENV } from "@/config/env.config";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export class S3FileUploadService implements IFileUploadService {
  private _s3Client: S3Client;

  constructor() {
    this._s3Client = new S3Client({
      region: ENV.AWS.REGION!,
      credentials: {
        accessKeyId: ENV.AWS.ACCESS_KEY_ID!,
        secretAccessKey: ENV.AWS.SECRET_KEY!,
      },
    });
  }
  async generateProfileImageUpload(
    userId: string,
    fileType: string
  ): Promise<{ uploadUrl: string; fileKey: string }> {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(fileType)) {
      throw new ValidationError("Unsupported Image type");
    }

    const extension = fileType.split("/")[1]; // jpeg | png | webp
    const fileKey = `profiles/${userId}/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: ENV.AWS.S3_BUCKET!,
      Key: fileKey,
      ContentType: fileType,
    });
    const uploadUrl = await getSignedUrl(this._s3Client, command, {
      expiresIn: 60 * 10,
    });
    return { uploadUrl, fileKey };
  }
  async generateProfileImageViewUrl(fileKey: string) {
    const command = new GetObjectCommand({
      Bucket: ENV.AWS.S3_BUCKET,
      Key: fileKey,
    });

    return getSignedUrl(this._s3Client, command, {
      expiresIn: 60 * 5, // 5 minutes
    });
  }
}
