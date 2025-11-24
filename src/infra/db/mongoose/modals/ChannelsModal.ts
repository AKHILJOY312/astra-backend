// src/infrastructure/persistence/mongoose/models/ChannelModel.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  Channel,
  ChannelProps,
} from "../../../../domain/entities/channel/Channel";

interface ChannelDoc extends Document {
  projectId: mongoose.Types.ObjectId;
  channelName: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isPrivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const channelSchema = new Schema<ChannelDoc>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    channelName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

channelSchema.index({ projectId: 1, channelName: 1 }, { unique: true });

export const ChannelModel = mongoose.model<ChannelDoc>(
  "Channel",
  channelSchema
);

// Mapper
export const toChannelEntity = (doc: ChannelDoc): Channel => {
  const props: ChannelProps = {
    id: doc._id.toString(),
    projectId: doc.projectId.toString(),
    channelName: doc.channelName,
    description: doc.description,
    createdBy: doc.createdBy.toString(),
    isPrivate: doc.isPrivate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  const channel = new Channel(props);
  channel.setId(doc._id.toString());
  return channel;
};
