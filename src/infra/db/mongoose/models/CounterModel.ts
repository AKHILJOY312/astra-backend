// src/infra/db/models/CounterModel.ts
import { Schema, model, Document } from "mongoose";

export interface CounterDoc extends Document {
  key: string; // e.g. "invoice-2026"
  seq: number;
}

const CounterSchema = new Schema<CounterDoc>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const CounterModel = model<CounterDoc>("Counter", CounterSchema);
