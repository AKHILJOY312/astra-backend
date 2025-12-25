// src/core/use-cases/channel/DeleteChannelUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import { IDeleteChannelUseCase } from "@/application/ports/use-cases/channel/IDeleteChannelUseCase";

@injectable()
export class DeleteChannelUseCase implements IDeleteChannelUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(channelId: string, userId: string) {
    const channel = await this.channelRepo.findById(channelId);
    if (!channel) throw new BadRequestError("Channel not found");

    const membership = await this.membershipRepo.findByProjectAndUser(
      channel.projectId,
      userId
    );

    if (!membership || membership.role !== "manager") {
      throw new UnauthorizedError("Only project admins can delete channels");
    }

    return await this.channelRepo.delete(channelId);
  }
}
