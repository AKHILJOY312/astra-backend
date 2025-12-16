import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";

@injectable()
export class DeleteUserAccountUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository,

    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const subscription = await this.subscriptionRepo.findByUserId(userId);

    if (subscription) {
      await this.subscriptionRepo.delete(subscription.id!);
    }

    // hard delete
    await (this.userRepo as any).delete(userId);
  }
}
