// src/infra/services/MongoTokenBlacklistService.ts
import { injectable } from "inversify";
import { BlacklistedTokenModel } from "@/infra/db/mongoose/models/BlacklistedTokenModel";
import { ITokenBlacklistService } from "../../application/ports/services/ITokenBlacklistService";

@injectable()
export class MongoTokenBlacklistService implements ITokenBlacklistService {
  async addToBlacklist(token: string, expiresAt: Date): Promise<void> {
    await BlacklistedTokenModel.create({
      token,
      expiresAt,
    }).catch((err) => {
      // Ignore if already exists (duplicate key)
      if (err.code !== 11000) throw err;
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const doc = await BlacklistedTokenModel.findOne({ token }).lean();
    return !!doc;
  }
}
