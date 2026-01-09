import { CounterModel } from "../models/CounterModel";
import { ICounterRepository } from "@/application/ports/repositories/ICounterRepository";

export class CounterRepository implements ICounterRepository {
  async getNext(key: string): Promise<number> {
    const counter = await CounterModel.findOneAndUpdate(
      { key },
      { $inc: { seq: 1 } },
      { new: true, upsert: true } // ← critical
    );

    return counter!.seq;
  }
}
