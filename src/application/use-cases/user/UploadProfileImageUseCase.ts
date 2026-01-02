import { injectable, inject } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import {
  IUploadProfileImageUseCase,
  GeneratePresignedUrlDTO,
  // GeneratePresignedUrlResponse,
  SaveProfileImageDTO,
} from "@/application/ports/use-cases/user/IUploadProfileImageUseCase";
import { NotFoundError } from "@/application/error/AppError";

// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { v4 as uuidv4 } from "uuid";
// import { ENV } from "@/config/env.config";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";

// console.log("AWS Credinals: ", ENV.AWS);

// @injectable()
// export class UploadProfileImageUseCase implements IUploadProfileImageUseCase {
//   private s3Client: S3Client;

//   constructor(
//     @inject(TYPES.UserRepository)
//     private userRepo: IUserRepository
//   ) {
//     this.s3Client = new S3Client({
//       region: ENV.AWS.REGION!,
//       credentials: {
//         accessKeyId: ENV.AWS.ACCESS_KEY_ID!,
//         secretAccessKey: ENV.AWS.SECRET_KEY!,
//       },
//     });
//   }

//   async generatePresignedUrl(
//     dto: GeneratePresignedUrlDTO
//   ): Promise<GeneratePresignedUrlResponse> {
//     const user = await this.userRepo.findById(dto.userId);
//     if (!user) throw new NotFoundError("User");

//     const fileExtension = dto.fileType.split("/")[1]; // jpeg, png, etc.
//     const key = `profiles/${dto.userId}/${uuidv4()}.${fileExtension}`;

//     const command = new PutObjectCommand({
//       Bucket: ENV.AWS.S3_BUCKET!,
//       Key: key,
//       ContentType: dto.fileType,
//       ACL: "public-read", // or remove if using bucket policy / CloudFront
//     });

//     const uploadUrl = await getSignedUrl(this.s3Client, command, {
//       expiresIn: 3600, // 1 hour
//     });

//     const imageUrl = `${ENV.AWS.S3_BASE_URL}/${key}`;

//     return { uploadUrl, imageUrl };
//   }

//   async saveImageUrl(dto: SaveProfileImageDTO): Promise<void> {
//     const user = await this.userRepo.findById(dto.userId);
//     if (!user) throw new NotFoundError("User");

//     user.setImageUrl(dto.imageUrl); // assuming you have this setter in your User entity
//     await this.userRepo.update(user);
//   }
// }
@injectable()
export class UploadProfileImageUseCase implements IUploadProfileImageUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository,

    @inject(TYPES.FileUploadService)
    private fileUploadService: IFileUploadService
  ) {}

  async generatePresignedUrl(dto: GeneratePresignedUrlDTO) {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError("User");

    return this.fileUploadService.generateProfileImageUpload(
      dto.userId,
      dto.fileType
    );
  }

  async saveImageUrl(dto: SaveProfileImageDTO) {
    const user = await this.userRepo.findById(dto.userId);
    if (!user) throw new NotFoundError("User");

    user.setImageUrl(dto.fileKey); // store key only
    await this.userRepo.update(user);
    return this.fileUploadService.generateProfileImageViewUrl(dto.fileKey);
  }
}
