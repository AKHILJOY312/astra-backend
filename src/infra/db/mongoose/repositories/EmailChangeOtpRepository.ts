import {
  //   CreateEmailChangeOtpDTO,
  IEmailChangeOtpRepository,
} from "@/application/ports/repositories/IEmailChangeOtpRepository";
import { HydratedDocument, Types } from "mongoose";
import {
  EmailChangeOtpDoc,
  EmailChangeOtpModal,
  toEmailChangeOtpEntity,
} from "@/infra/db/mongoose/models/EmailChangeOtpModel";
import { EmailChangeOtp } from "@/domain/entities/auth/EmailChangeOtp";

export class EmailChangeOtpRepository implements IEmailChangeOtpRepository {
  //Mapper: Mongo Doc -> domain Entity
  private toDomain(doc: HydratedDocument<EmailChangeOtpDoc>): EmailChangeOtp {
    return toEmailChangeOtpEntity(doc);
  }
  //Mapper:Domain Entity-> MongoDb save Format
  private toPersistence(entity: EmailChangeOtp): Partial<EmailChangeOtpDoc> {
    const json = entity.toJSON();
    return {
      userId: new Types.ObjectId(json.userId),
      newEmail: json.newEmail,
      otpHash: json.otpHash,
      attempts: json.attempts,
      expiresAt: json.expiresAt,
    };
  }

  async findByUserId(userId: string): Promise<EmailChangeOtp | null> {
    const doc = await EmailChangeOtpModal.findOne({
      userId: new Types.ObjectId(userId),
    });
    return doc ? this.toDomain(doc) : null;
  }

  async upsert(data: EmailChangeOtp): Promise<void> {
    const doc = this.toPersistence(data);

    await EmailChangeOtpModal.findOneAndUpdate(
      { userId: doc.userId },
      { $set: doc },
      { upsert: true, new: true },
    );
  }

  async deleteByUserId(userId: string): Promise<void> {
    await EmailChangeOtpModal.deleteOne({ userId: new Types.ObjectId(userId) });
  }
  async incrementAttempts(userId: string): Promise<void> {
    await EmailChangeOtpModal.updateOne(
      { userId: new Types.ObjectId(userId) },
      {
        $inc: { attempts: 1 },
      },
    );
  }

  async countRecentByUserId(userId: string, since: Date): Promise<number> {
    return EmailChangeOtpModal.countDocuments({
      userId: new Types.ObjectId(userId),
      createAt: { $gte: since },
    });
  }
}
