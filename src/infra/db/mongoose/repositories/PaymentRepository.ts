import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { Payment, PaymentStatus } from "@/domain/entities/billing/Payment";
import {
  PaymentModel,
  PaymentDoc,
} from "@/infra/db/mongoose/models/PaymentModel";
import { injectable } from "inversify";
import mongoose, { FilterQuery } from "mongoose";

@injectable()
export class PaymentRepository implements IPaymentRepository {
  private toEntity(doc: PaymentDoc): Payment {
    const payment = new Payment({
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      planId: doc.planId,
      planName: doc.planName,
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
  async update(payment: Payment): Promise<void> {
    await PaymentModel.findOneAndUpdate(
      { razorpayOrderId: payment.razorpayOrderId },
      {
        status: payment.status,
        razorpayPaymentId: payment.razorpayPaymentId,
        invoiceNumber: payment.invoiceNumber,
      },
    );
  }
  async updateStatus(
    orderId: string,
    status: string,
    paymentId?: string,
  ): Promise<void> {
    await PaymentModel.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status, razorpayPaymentId: paymentId },
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
  async findByInvoiceId(invoiceNumber: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({ invoiceNumber });
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
  async findByRazorpayOrderId(id: string): Promise<Payment | null> {
    const doc = await PaymentModel.findOne({
      razorpayOrderId: id,
    });

    return doc ? this.toEntity(doc) : null;
  }
  async findByUserIdPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: Payment[]; total: number }> {
    const filter: FilterQuery<PaymentDoc> = { userId };

    if (search) {
      filter.$or = [
        {
          invoiceNumber: { $regex: search, $options: "i" },
        },
        { planName: { $regex: search, $options: "i" } },
      ];
    }
    const [docs, total] = await Promise.all([
      PaymentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      PaymentModel.countDocuments(filter),
    ]);

    return {
      data: docs.map(this.toEntity),
      total,
    };
  }

  async getAdminSummary(userId: string): Promise<any> {
    const summary = await PaymentModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      {
        $lookup: {
          from: "usersubscriptions",
          localField: "userId",
          foreignField: "userId",
          as: "subData",
        },
      },
      { $unwind: { path: "$subData", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$userId",
          user: { $first: "$userData" },
          subscription: { $first: "$subData" },
          ltv: {
            $sum: { $cond: [{ $eq: ["$status", "captured"] }, "$amount", 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          totalTx: { $count: {} },
          history: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          userId: "$_id",
          user: {
            name: "$user.name",
            email: "$user.email",
            status: { $cond: ["$user.isBlocked", "suspended", "active"] },
            signupDate: "$user.createdAt",
          },
          subscription: 1,
          stats: {
            ltv: "$ltv",
            failedCount: "$failedCount",
            totalTransactions: "$totalTx",
          },
          history: { $slice: ["$history", 10] },
        },
      },
    ]);

    return summary[0];
  }
  async getPaymentsOverview(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    // Build search filter
    const matchFilter: any = {};
    if (search) {
      matchFilter.$or = [
        { "billingSnapshot.userName": { $regex: search, $options: "i" } },
        { "billingSnapshot.userEmail": { $regex: search, $options: "i" } },
      ];
    }

    const result = await PaymentModel.aggregate([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$userId",
          userName: { $first: "$billingSnapshot.userName" },
          userEmail: { $first: "$billingSnapshot.userEmail" },
          planName: { $first: "$planName" },
          status: { $first: "$status" }, // Captured from the last payment status
          totalSpent: {
            $sum: { $cond: [{ $eq: ["$status", "captured"] }, "$amount", 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          lastPaymentDate: { $max: "$createdAt" },
        },
      },
      {
        $facet: {
          metadata: [
            { $count: "total" },
            { $addFields: { totalRevenue: { $sum: "$totalSpent" } } },
          ],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const metadata = result[0].metadata[0] || { total: 0, totalRevenue: 0 };
    const data = result[0].data;

    return {
      data,
      total: metadata.total,
      totalRevenue: metadata.totalRevenue,
    };
  }

  async getDashboardRevenueMetrics(today: Date, month: Date) {
    const stats = await PaymentModel.aggregate([
      {
        $facet: {
          // Section A: Revenue & Section C: Status
          metrics: [
            {
              $group: {
                _id: null,
                todayRev: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "captured"] },
                          { $gte: ["$createdAt", today] },
                        ],
                      },
                      "$amount",
                      0,
                    ],
                  },
                },
                monthRev: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ["$status", "captured"] },
                          { $gte: ["$createdAt", month] },
                        ],
                      },
                      "$amount",
                      0,
                    ],
                  },
                },
                failedCount: {
                  $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
                },
                pendingCount: {
                  $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
                },
              },
            },
          ],
          // Section E: Plan Distribution
          planDist: [
            { $match: { status: "captured" } },
            {
              $group: {
                _id: "$planName",
                userCount: { $addToSet: "$userId" },
                revenue: { $sum: "$amount" },
              },
            },
            {
              $project: {
                planName: "$_id",
                userCount: { $size: "$userCount" },
                revenue: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    const m = stats[0].metrics[0] || {};
    return {
      mrr: m.monthRev || 0, // Basic MRR calculation (Total Monthly Captured)
      today: m.todayRev || 0,
      thisMonth: m.monthRev || 0,
      changePercentage: 0, // Would require comparing to a previous period query
      paymentStatus: {
        successToday: 0, // Add count logic here
        failedCount: m.failedCount || 0,
        pendingCount: m.pendingCount || 0,
        refundsMonth: 0,
      },
      planDistribution: stats[0].planDist,
    };
  }
}
