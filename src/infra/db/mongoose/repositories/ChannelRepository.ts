// src/infrastructure/persistence/mongoose/repositories/ChannelRepository.ts
import { IChannelRepository } from "@/application/repositories/IChannelRepository";
import { Channel } from "../../../../domain/entities/channel/Channel";
import { ChannelModel, toChannelEntity } from "../models/ChannelModal";

export class ChannelRepository implements IChannelRepository {
  async create(channel: Channel): Promise<Channel> {
    const doc = new ChannelModel({
      projectId: channel.projectId,
      channelName: channel.channelName,
      description: channel.description,
      createdBy: channel.createdBy,

      visibleToRoles: channel.visibleToRoles,
      permissionsByRole: channel.permissionsByRole,
    });

    const saved = await doc.save();
    return toChannelEntity(saved);
  }

  async update(channel: Channel): Promise<Channel> {
    const saved = await ChannelModel.findByIdAndUpdate(channel.id, {
      channelName: channel.channelName,
      description: channel.description,

      visibleToRoles: channel.visibleToRoles,
      permissionsByRole: channel.permissionsByRole,
    });
    if (!saved) throw new Error("Channel not found for update");
    return toChannelEntity(saved);
  }

  async delete(id: string): Promise<Channel | null> {
    const doc = await ChannelModel.findByIdAndDelete(id);
    return doc ? toChannelEntity(doc) : null;
  }

  async findById(id: string): Promise<Channel | null> {
    const doc = await ChannelModel.findById(id);
    return doc ? toChannelEntity(doc) : null;
  }

  async findByProjectId(projectId: string): Promise<Channel[]> {
    const docs = await ChannelModel.find({ projectId }).sort({ createdAt: 1 });
    return docs.map(toChannelEntity);
  }

  async findByProjectAndName(
    projectId: string,
    channelName: string
  ): Promise<Channel | null> {
    const doc = await ChannelModel.findOne({ projectId, channelName });
    return doc ? toChannelEntity(doc) : null;
  }

  async countByProjectId(projectId: string): Promise<number> {
    return ChannelModel.countDocuments({ projectId });
  }
}
