import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { Payment, PaymentStatus } from "@/domain/entities/billing/Payment";
import { PaymentModel, PaymentDoc } from "../models/PaymentModel";
import { injectable } from "inversify";
import { FilterQuery } from "mongoose";

@injectable()
export class PaymentRepository implements IPaymentRepository {
  private toEntity(doc: PaymentDoc): Payment {
    const payment = new Payment({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      planId: doc.planId,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status as PaymentStatus,
      method: doc.method,
      razorpayOrderId: doc.razorpayOrderId,
      razorpayPaymentId: doc.razorpayPaymentId,
      invoiceNumber: doc.invoiceNumber,
      billingSnapshot: doc.billingSnapshot,
      createdAt: doc.createdAt,
    });
    return payment;
  }

  async create(payment: Payment): Promise<Payment> {
    const data = payment.toJSON();
    const doc = await PaymentModel.create(data);
    payment.setId(doc._id.toString());
    return payment;
  }

  async updateStatus(
    orderId: string,
    status: string,
    paymentId?: string
  ): Promise<void> {
    await PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status, razorpayPaymentId: paymentId }
    );
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const docs = await PaymentModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map(this.toEntity);
  }

  async findById(id: string): Promise<Payment | null> {
    const doc = await PaymentModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async countAll(): Promise<number> {
    return await PaymentModel.countDocuments();
  }

  async getAllPaginated(page: number, limit: number, search?: string) {
    const query: FilterQuery<PaymentDoc> = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { razorpayOrderId: { $regex: search, $options: "i" } },
        { "billingSnapshot.userEmail": { $regex: search, $options: "i" } },
      ];
    }

    const [data, total, stats] = await Promise.all([
      PaymentModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PaymentModel.countDocuments(query),
      PaymentModel.aggregate([
        { $match: { status: "captured" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
    ]);

    return {
      data: data.map(this.toEntity),
      total,
      totalRevenue: stats[0]?.totalRevenue || 0,
    };
  }
}
