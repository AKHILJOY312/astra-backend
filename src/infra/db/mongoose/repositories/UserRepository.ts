import { FilterQuery, UpdateQuery } from "mongoose";
import UserModel, { IUserDocument } from "@/infra/db/mongoose/models/UserModel";
import { User, UserProps } from "@/domain/entities/user/User";
import {
  IUserRepository,
  PaginationResult,
} from "@/application/ports/repositories/IUserRepository";
import { ListUsersQuery } from "@/application/use-cases/user/ListUserUseCase";

export class UserRepository implements IUserRepository {
  // Changed doc: any -> doc: IUserDocument
  private toDomain(doc: IUserDocument): User {
    const props: UserProps = {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      password: doc.password,
      isAdmin: doc.isAdmin,
      isBlocked: doc.isBlocked,
      isVerified: doc.isVerified,
      verificationToken: doc.verificationToken ?? null,
      verificationTokenExpires: doc.verificationTokenExpires ?? null,
      resetPasswordToken: doc.resetPasswordToken ?? null,
      resetPasswordExpires: doc.resetPasswordExpires ?? null,
      securityStamp: doc.securityStamp ?? "",
      imageUrl: doc.avatarUrl ?? undefined,
      about: doc.about ?? undefined,
      phone: doc.phone ?? undefined,
      link: doc.link ?? undefined,
      createdAt: doc.createdAt,
    };

    return new User(props);
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email }).select("+password").exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).select("-password").exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByResetToken(token: string): Promise<User | null> {
    const doc = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async create(user: User): Promise<User> {
    const doc = await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      securityStamp: user.securityStamp,
      verificationToken: user.verificationToken ?? undefined,
      verificationTokenExpires: user.verificationTokenExpires ?? undefined,
    });

    return this.toDomain(doc);
  }

  async update(user: User): Promise<void> {
    if (!user.id) throw new Error("Cannot save user without id");

    const $set: UpdateQuery<IUserDocument>["$set"] = {
      email: user.email,
      isVerified: user.isVerified,
      password: user.password,
      name: user.name,
      avatar_url: user.ImageUrl ?? null,
      about: user.about ?? null,
      phone: user.phone ?? null,
      link: user.link ?? null,
      isAdmin: user.isAdmin,
      isBlocked: user.isBlocked,
      securityStamp: user.securityStamp,
      verificationToken: user.verificationToken ?? undefined,
      verificationTokenExpires: user.verificationTokenExpires ?? undefined,
      resetPasswordToken: user.resetPasswordToken ?? undefined,
      resetPasswordExpires: user.resetPasswordExpires ?? undefined,
    };

    // Clean up undefined values for $unset if needed
    const $unset: UpdateQuery<IUserDocument>["$unset"] = {};
    if (user.verificationToken === null) $unset.verificationToken = "";
    if (user.resetPasswordToken === null) $unset.resetPasswordToken = "";

    await UserModel.updateOne({ _id: user.id }, { $set, $unset }).exec();
  }

  async findUsersWithPagination(
    query: ListUsersQuery,
  ): Promise<PaginationResult> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // Use FilterQuery<IUserDocument> instead of any
    const filter: FilterQuery<IUserDocument> = {};

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const [docs, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password")
        .exec(),
      UserModel.countDocuments(filter).exec(),
    ]);

    return {
      users: docs.map((doc) => this.toDomain(doc)),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
  async findByIdWithPassword(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).select("+password").exec();
    return doc ? this.toDomain(doc) : null;
  }
  async updateStatus(userId: string): Promise<void> {
    // Mongoose update pipelines require cast as any or specific casting
    await UserModel.updateOne({ _id: userId }, [
      { $set: { isBlocked: { $not: "$isBlocked" } } },
    ]).exec();
  }

  async updateRole(userId: string): Promise<void> {
    await UserModel.updateOne({ _id: userId }, [
      { $set: { isAdmin: { $not: "$isAdmin" } } },
    ]).exec();
  }

  async countAdmins(): Promise<number> {
    return UserModel.countDocuments({ isAdmin: true }).exec();
  }

  async updateSecurityStamp(userId: string, stamp: string): Promise<void> {
    await UserModel.updateOne(
      { _id: userId },
      { $set: { securityStamp: stamp } },
    ).exec();
  }

  async delete(userId: string): Promise<void> {
    await UserModel.deleteOne({ _id: userId }).exec();
    // Fixed: changed {userId} to {_id: userId} to match Mongo primary key
  }

  async getDashboardUserMetrics(startOfToday: Date) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const stats = await UserModel.aggregate([
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          newToday: [
            { $match: { createdAt: { $gte: startOfToday } } },
            { $count: "count" },
          ],
          newThisWeek: [
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $count: "count" },
          ],
          // Active = logged in within last 30 days
          activeUsers: [
            {
              $match: {
                updatedAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const s = stats[0];
    return {
      total: s.totalUsers[0]?.count || 0,
      newToday: s.newToday[0]?.count || 0,
      newThisWeek: s.newThisWeek[0]?.count || 0,
      activeUsers: s.activeUsers[0]?.count || 0,
      inactiveUsers:
        (s.totalUsers[0]?.count || 0) - (s.activeUsers[0]?.count || 0),
    };
  }
}
