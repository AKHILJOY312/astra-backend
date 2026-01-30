import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { NotFoundError } from "@/application/error/AppError";
import {
  IGetUserProfileUseCase,
  UserProfileResponseDTO,
} from "@/application/ports/use-cases/user/IGetUserProfileUseCase";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private _userRepo: IUserRepository,

    @inject(TYPES.UserSubscriptionRepository)
    private _subscriptionRepo: IUserSubscriptionRepository,
    @inject(TYPES.FileUploadService) private _fileUploadSvc: IFileUploadService,
  ) {}

  async execute(userId: string): Promise<UserProfileResponseDTO> {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    let profileImageUrl = undefined;
    if (user.ImageUrl) {
      profileImageUrl = await this._fileUploadSvc.generateProfileImageViewUrl(
        user.ImageUrl,
      );
    }
    const activeSubscription =
      await this._subscriptionRepo.findActiveByUserId(userId);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: profileImageUrl,
      about: user.about,
      phone: user.phone,
      link: user.link,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      plan: activeSubscription
        ? {
            planType: activeSubscription.planType,
            amount: activeSubscription.amount,
            currency: activeSubscription.currency,
            status: activeSubscription.status,
            endDate: activeSubscription.endDate,
          }
        : null,
    };
  }
}
