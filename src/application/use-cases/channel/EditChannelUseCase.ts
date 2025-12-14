// src/core/use-cases/channel/EditChannelUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";

export interface EditChannelDTO {
  channelId: string;
  userId: string;
  channelName?: string;
  description?: string;
  visibleToRoles?: string[];
  permissionsByRole?: Record<string, "view" | "message" | "manager">;
}

@injectable()
export class EditChannelUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
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
