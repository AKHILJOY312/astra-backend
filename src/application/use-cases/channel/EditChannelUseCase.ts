// src/core/use-cases/channel/EditChannelUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IEditChannelUseCase } from "@/application/ports/use-cases/channel/IEditChannelUseCase";
import { EditChannelDTO } from "@/application/dto/channel/channelDtos";

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
    console.log(membership);
    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only project admins can edit channels");
    }

    if (channelName && channel.channelName !== channelName) {
      const sameNameExist = await this.channelRepo.findByProjectAndName(
        channel.projectId,
        channelName!
      );
      if (sameNameExist) {
        throw new BadRequestError(
          "Channel with this same name exists. Try a another name."
        );
      }
    }

    if (channelName) channel.rename(channelName);
    if (description !== undefined) channel.updateDescription(description);
    if (visibleToRoles) channel.updateVisibility(visibleToRoles);
    if (permissionsByRole) channel.updatePermissions(permissionsByRole);

    return await this.channelRepo.update(channel);
  }
}
