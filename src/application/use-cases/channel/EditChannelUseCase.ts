// src/core/use-cases/channel/EditChannelUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/di/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IEditChannelUseCase } from "@/application/ports/use-cases/channel/IEditChannelUseCase";
import {
  ChannelResponseDto,
  EditChannelDTO,
} from "@/application/dto/channel/channelDtos";
import { Channel } from "@/domain/entities/channel/Channel";

@injectable()
export class EditChannelUseCase implements IEditChannelUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private _channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private _membershipRepo: IProjectMembershipRepository,
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

    const channel = await this._channelRepo.findById(channelId);
    if (!channel) throw new BadRequestError("Channel not found");

    const membership = await this._membershipRepo.findByProjectAndUser(
      channel.projectId,
      userId,
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only project admins can edit channels");
    }

    if (channelName && channel.channelName !== channelName) {
      const sameNameExist = await this._channelRepo.findByProjectAndName(
        channel.projectId,
        channelName!,
      );
      if (sameNameExist) {
        throw new BadRequestError(
          "Channel with this same name exists. Try a another name.",
        );
      }
    }

    if (channelName) channel.rename(channelName);
    if (description !== undefined) channel.updateDescription(description);
    if (visibleToRoles) channel.updateVisibility(visibleToRoles);
    if (permissionsByRole) channel.updatePermissions(permissionsByRole);
    const result = await this._channelRepo.update(channel);
    if (!result) {
      throw new Error("Channel update not complete, Please try again");
    }
    return this.toResponseDto(result);
  }
  private toResponseDto(channel: Channel): ChannelResponseDto {
    return {
      id: channel.id!,
      projectId: channel.projectId,
      channelName: channel.channelName,
      description: channel.description || "",
      createdBy: channel.createdBy,
      visibleToRoles: channel.visibleToRoles,
      permissionsByRole: channel.permissionsByRole,
      createdAt: channel.createdAt,
      updatedAt: channel.updatedAt,
    };
  }
}
