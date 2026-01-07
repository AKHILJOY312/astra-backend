// import { UserSubscription } from "@/domain/entities/billing/UserSubscription";

export interface UpgradeToPlanInput {
  userId: string;
  planId: string;
}

export interface UpgradeToPlanOutput {
  // subscription: UserSubscription;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface IUpgradeToPlanUseCase {
  execute(input: UpgradeToPlanInput): Promise<UpgradeToPlanOutput>;
}
