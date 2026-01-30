import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { NotFoundError } from "@/application/error/AppError";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";

@injectable()
export class DeleteUserAccountUseCase implements IDeleteUserAccountUseCase {
  constructor(
    @inject(TYPES.UserRepository)
    private _userRepo: IUserRepository,

    @inject(TYPES.UserSubscriptionRepository)
    private _subscriptionRepo: IUserSubscriptionRepository,
  ) {}

  async execute(userId: string) {
    const user = await this._userRepo.findById(userId);
    if (!user) throw new NotFoundError("User");

    const subscription = await this._subscriptionRepo.findByUserId(userId);

    if (subscription) {
      await this._subscriptionRepo.delete(subscription.id!);
    }

    // hard delete
    await this._userRepo.delete(userId);
  }
}
