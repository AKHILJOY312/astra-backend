export interface UserPaymentHistoryDTO {
  invoiceNumber?: string;
  planName: string;
  amount: number;
  currency: string;
  status: "pending" | "captured" | "failed";
  method: string;
  paidAt: Date;
}

export interface UserSubscriptionHistoryDTO {
  planName: string;
  startDate: Date;
  endDate: Date | null;
  status: "active" | "expired" | "cancelled" | "pending";
  amount: number;
}

export interface UserBillingHistoryOutput {
  subscription: UserSubscriptionHistoryDTO | null;
  payments: UserPaymentHistoryDTO[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}
export interface IGetUserBillingHistoryUseCase {
  execute(
    userId: string,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<UserBillingHistoryOutput>;
}
