import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";

@injectable()
export class GetUserProfileUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository,

    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

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
