// src/core/use-cases/channel/CreateChannelUseCase.ts

import { inject, injectable } from "inversify";
import { Channel } from "../../../domain/entities/channel/Channel";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/di/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import {
  CreateChannelDTO,
  CreateChannelResultDTO,
} from "@/application/dto/channel/channelDtos";
import { ICreateChannelUseCase } from "@/application/ports/use-cases/channel/ICreateChannelUseCase";

@injectable()
export class CreateChannelUseCase implements ICreateChannelUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private _channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private _membershipRepo: IProjectMembershipRepository,
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
    const membership = await this._membershipRepo.findByProjectAndUser(
      projectId,
      createdBy,
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only project manager can create channels");
    }

    // 2. Unique name
    const exists = await this._channelRepo.findByProjectAndName(
      projectId,
      channelName,
    );
    if (exists) {
      throw new BadRequestError("Channel name already exists");
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

    const saved = await this._channelRepo.create(channel);

    return { channel: saved };
  }
}
