// src/core/use-cases/channel/EditChannelUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import {
  EditChannelDTO,
  IEditChannelUseCase,
} from "@/application/ports/use-cases/channel/IEditChannelUseCase";

@injectable()
export class EditChannelUseCase implements IEditChannelUseCase {
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

    const channel = await this.channelRepo.findById(channelId);
    if (!channel) throw new BadRequestError("Channel not found");

    const membership = await this.membershipRepo.findByProjectAndUser(
      channel.projectId,
      userId
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only project admins can edit channels");
    }

    if (channelName) channel.rename(channelName);
    if (description !== undefined) channel.updateDescription(description);
    if (visibleToRoles) channel.updateVisibility(visibleToRoles);
    if (permissionsByRole) channel.updatePermissions(permissionsByRole);

    return await this.channelRepo.update(channel);
  }
}
