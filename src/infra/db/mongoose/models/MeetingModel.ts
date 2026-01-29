// src/infrastructure/persistence/mongoose/models/MeetingModel.ts

import mongoose, { Schema, Document, Types } from "mongoose";
import {
  Meeting,
  MeetingProps,
  MeetingParticipant as MeetingParticipantDoc,
} from "@/domain/entities/meeting/Meeting";

// export interface MeetingParticipantDoc {
//   userId?: string;
//   socketId?: string;
//   joinedAt: Date;
//   leftAt?: Date;
// }

export interface MeetingDoc extends Document {
  _id: Types.ObjectId;

  code: string;
  createdBy?: string | null;
  status: "active" | "ended";
  maxParticipants: number;
  participants: MeetingParticipantDoc[];
  createdAt?: Date;
  updatedAt?: Date;
}

const participantSchema = new Schema<MeetingParticipantDoc>(
  {
    userId: { type: String },
    socketId: { type: String },
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date },
  },
  { _id: false },
);

const meetingSchema = new Schema<MeetingDoc>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    createdBy: { type: String, default: null },
    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
      max: 50, // future-safe
      default: 6,
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
  },
  { timestamps: true },
);

export const MeetingModel = mongoose.model<MeetingDoc>(
  "Meeting",
  meetingSchema,
);

export const toMeetingEntity = (doc: MeetingDoc): Meeting => {
  const props: MeetingProps = {
    id: doc._id.toString(),
    code: doc.code,
    createdBy: doc.createdBy ?? null,
    status: doc.status,
    maxParticipants: doc.maxParticipants,
    participants: doc.participants.map((p) => ({
      userId: p.userId,
      socketId: p.socketId,
      joinedAt: p.joinedAt,
      leftAt: p.leftAt,
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return new Meeting(props);
};
