import { Payment } from "../../../domain/entities/billing/Payment";

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  updateStatus(
    orderId: string,
    status: string,
    paymentId?: string
  ): Promise<void>;
  findByUserId(userId: string): Promise<Payment[]>;
  findById(id: string): Promise<Payment | null>;

  // For Admin Financial Health & List
  getAllPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    data: Payment[];
    total: number;
    totalRevenue: number;
  }>;

  countAll(): Promise<number>; // Used for Invoice numbering
}
