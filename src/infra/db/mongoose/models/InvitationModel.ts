// src/infra/db/mongoose/models/InvitationModel.ts

import { Schema, model, Document, Types } from "mongoose";
// import { InvitationProps } from '@/domain/entities/project/Invitation';

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

// Define the Mongoose document interface without extending InvitationProps directly
export interface IInvitationDocument extends Document<Types.ObjectId> {
  invitationId: string;

  projectId: string;
  email: string;
  role: "member" | "manager" | "lead";
  inviterId?: string;
  token: string;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;

  // Virtual to match domain entity's `id` getter
  id: string;
}

const InvitationSchema = new Schema<IInvitationDocument>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["member", "manager"],
      required: true,
    },
    invitationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    inviterId: {
      type: String,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: 1, // For potential TTL or queries
    },
  },
  {
    timestamps: false,
    collection: "invitations",
    // Enable virtuals when converting to JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index: efficient count of pending invitations per project
InvitationSchema.index({ projectId: 1, status: 1 });

// Unique partial index: only one pending invitation per email + project
InvitationSchema.index(
  { projectId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

// Optional TTL: auto-delete documents after expiresAt (remove if you want to keep history)
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InvitationModel = model<IInvitationDocument>(
  "Invitation",
  InvitationSchema
);
