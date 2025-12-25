import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { NotFoundError } from "@/application/error/AppError";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";

@injectable()
export class DeleteUserAccountUseCase implements IDeleteUserAccountUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private userRepo: IUserRepository,

    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const subscription = await this.subscriptionRepo.findByUserId(userId);

    if (subscription) {
      await this.subscriptionRepo.delete(subscription.id!);
    }

    // hard delete
    await this.userRepo.delete(userId);
  }
}
