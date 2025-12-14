// src/core/use-cases/channel/CreateChannelUseCase.ts

import { inject, injectable } from "inversify";
import { Channel } from "../../../domain/entities/channel/Channel";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";

export interface CreateChannelDTO {
  projectId: string;
  channelName: string;
  description?: string;
  createdBy: string;

  visibleToRoles: string[];
  permissionsByRole: Record<string, "view" | "message" | "manager">;
}

export interface CreateChannelResultDTO {
  channel: Channel;
}

@injectable()
export class CreateChannelUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(input: CreateChannelDTO): Promise<CreateChannelResultDTO> {
    const {
      projectId,
      channelName,
      description,
      createdBy,
      visibleToRoles,
      permissionsByRole,
    } = input;

    // 1. Check user role → must be ADMIN
    const membership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      createdBy
    );
    console.log("membership: ", membership);
    if (!membership || membership.role !== "manager") {
      throw new Error("Only project manager can create channels");
    }

    // 2. Unique name
    const exists = await this.channelRepo.findByProjectAndName(
      projectId,
      channelName
    );
    if (exists) {
      throw new Error("Channel name already exists");
    }

    // 3. Create entity
    const channel = new Channel({
      projectId,
      channelName: channelName.trim(),
      description,
      createdBy,
      visibleToRoles,
      permissionsByRole,
    });

    const saved = await this.channelRepo.create(channel);

    return { channel: saved };
  }
}
