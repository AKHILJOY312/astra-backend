import { Payment } from "@/domain/entities/billing/Payment";

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
  update(payment: Payment): Promise<Payment | void>;
  updateStatus(
    orderId: string,
    status: string,
    paymentId?: string,
  ): Promise<void>;
  findByUserId(userId: string): Promise<Payment[]>;
  findByInvoiceId(invoiceNumber: string): Promise<Payment | null>;
  findById(id: string): Promise<Payment | null>;
  findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: Payment[];
    total: number;
  }>;

  // For Admin Financial Health & List
  getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{
    data: Payment[];
    total: number;
    totalRevenue: number;
  }>;
  findByRazorpayOrderId(orderId: string): Promise<Payment | null>;
  countAll(): Promise<number>; // Used for Invoice numbering
}
