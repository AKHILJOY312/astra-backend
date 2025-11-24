// src/core/use-cases/channel/CreateChannelUseCase.ts
import { Channel } from "../../../domain/entities/channel/Channel";
import { IChannelRepository } from "../../repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../repositories/IProjectMembershipRepository";

export interface CreateChannelDTO {
  projectId: string;
  channelName: string;
  description?: string;
  isPrivate?: boolean;
  createdBy: string;
}

export interface CreateChannelResultDTO {
  channel: Channel;
}

export class CreateChannelUseCase {
  constructor(
    private channelRepo: IChannelRepository,
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(input: CreateChannelDTO): Promise<CreateChannelResultDTO> {
    const {
      projectId,
      channelName,
      description,
      isPrivate = false,
      createdBy,
    } = input;

    // 1. Check permission: must be member or manager
    const membership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      createdBy
    );
    if (!membership) {
      throw new Error("You must be a project member to create a channel");
    }

    // 2. Check channel name uniqueness
    const exists = await this.channelRepo.findByProjectAndName(
      projectId,
      channelName
    );
    if (exists) {
      throw new Error("A channel with this name already exists");
    }

    const channel = new Channel({
      projectId,
      channelName: channelName.trim(),
      description,
      createdBy,
      isPrivate,
    });

    const saved = await this.channelRepo.create(channel);

    return { channel: saved };
  }
}
