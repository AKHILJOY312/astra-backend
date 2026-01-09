import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
// import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import {
  IGetUserBillingHistoryUseCase,
  UserBillingHistoryOutput,
} from "@/application/ports/use-cases/upgradetopremium/IGetUserBillingHistoryUseCase ";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class GetUserBillingUseCase implements IGetUserBillingHistoryUseCase {
  constructor(
    @inject(TYPES.PaymentRepository) private paymentRepo: IPaymentRepository,
    @inject(TYPES.UserSubscriptionRepository)
    private subscriptionRepo: IUserSubscriptionRepository
  ) {}

  async execute(
    userId: string,
    page = 1,
    limit = 5,
    search?: string
  ): Promise<UserBillingHistoryOutput> {
    console.log(userId, page, limit, search);
    const { data, total } = await this.paymentRepo.findByUserIdPaginated(
      userId,
      page,
      limit,
      search
    );

    const subscription = await this.subscriptionRepo.findByUserId(userId);

    return {
      subscription: subscription
        ? {
            planName: subscription.planType,
            startDate: subscription.startDate,
            endDate: subscription.endDate ?? null,
            status: subscription.status,
            amount: subscription.amount,
          }
        : null,

      payments: data.map((p) => ({
        invoiceNumber: p.invoiceNumber,
        planName: p.planName,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        method: p.method,
        paidAt: p.createdAt!,
        canDownloadInvoice: p.status === "captured",
      })),

      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  }
}
