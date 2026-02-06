// src/core/use-cases/channel/DeleteChannelUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/di/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IDeleteChannelUseCase } from "@/application/ports/use-cases/channel/IDeleteChannelUseCase";
import { Channel } from "@/domain/entities/channel/Channel";
import { ChannelResponseDto } from "@/application/dto/channel/channelDtos";

@injectable()
export class DeleteChannelUseCase implements IDeleteChannelUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private _channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private _membershipRepo: IProjectMembershipRepository,
  ) {}

  async execute(channelId: string, userId: string) {
    const channel = await this._channelRepo.findById(channelId);
    if (!channel) throw new BadRequestError("Channel not found");

    const membership = await this._membershipRepo.findByProjectAndUser(
      channel.projectId,
      userId,
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only project admins can delete channels");
    }
    const result = await this._channelRepo.delete(channelId);

    if (!result) {
      throw new BadRequestError("Channel not Deleted");
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
