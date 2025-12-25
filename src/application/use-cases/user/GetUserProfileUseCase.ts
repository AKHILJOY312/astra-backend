import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { NotFoundError } from "@/application/error/AppError";
import {
  IGetUserProfileUseCase,
  UserProfileResponseDTO,
} from "@/application/ports/use-cases/user/IGetUserProfileUseCase";

@injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository,

    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository
  ) {}

  async execute(userId: string): Promise<UserProfileResponseDTO> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const activeSubscription = await this.subscriptionRepo.findActiveByUserId(
      userId
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.ImageUrl,
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
