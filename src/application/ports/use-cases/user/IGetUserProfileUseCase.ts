// src/application/ports/useCases/IGetUserProfileUseCase.ts

import { SubscriptionStatus } from "@/domain/entities/billing/UserSubscription";

export interface SubscriptionInfoDTO {
  planType: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  endDate?: Date | null;
}

export interface UserProfileResponseDTO {
  id: string | undefined;
  name: string;
  email: string;
  imageUrl?: string;
  isVerified: boolean;
  createdAt: Date | undefined;
  plan: SubscriptionInfoDTO | null;
}

export interface IGetUserProfileUseCase {
  execute(userId: string): Promise<UserProfileResponseDTO>;
}
