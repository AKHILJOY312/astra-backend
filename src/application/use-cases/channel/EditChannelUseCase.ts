// src/core/use-cases/channel/EditChannelUseCase.ts

import { IChannelRepository } from "../../repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../repositories/IProjectMembershipRepository";

export interface EditChannelDTO {
  channelId: string;
  userId: string;
  channelName?: string;
  description?: string;
  visibleToRoles?: string[];
  permissionsByRole?: Record<string, "view" | "message" | "manager">;
}

export class EditChannelUseCase {
  constructor(
    private channelRepo: IChannelRepository,
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(input: EditChannelDTO) {
    const {
      channelId,
      userId,
      channelName,
      description,
      visibleToRoles,
      permissionsByRole,
    } = input;
    console.log("input: ", input);
    const channel = await this.channelRepo.findById(channelId);
    if (!channel) throw new Error("Channel not found");
    console.log("channel found: ", channel);
    // Only ADMIN can edit
    const membership = await this.membershipRepo.findByProjectAndUser(
      channel.projectId,
      userId
    );
    console.log("membership found: ", membership);
    if (!membership || membership.role !== "manager") {
      throw new Error("Only project admins can edit channels");
    }

    if (channelName) channel.rename(channelName);
    if (description !== undefined) channel.updateDescription(description);
    if (visibleToRoles) channel.updateVisibility(visibleToRoles);
    if (permissionsByRole) channel.updatePermissions(permissionsByRole);
    console.log("updated channel: ", channel);
    return await this.channelRepo.update(channel);
  }
}
