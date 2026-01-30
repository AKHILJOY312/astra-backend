// src/core/use-cases/channel/ListChannelsForUserUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/application/error/AppError";
import { IListChannelsForUserUseCase } from "@/application/ports/use-cases/channel/IListChannelsForUserUseCase";

@injectable()
export class ListChannelsForUserUseCase implements IListChannelsForUserUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private _channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private _membershipRepo: IProjectMembershipRepository,
  ) {}

  async execute(projectId: string, userId: string) {
    const membership = await this._membershipRepo.findByProjectAndUser(
      projectId,
      userId,
    );
    if (!membership)
      throw new UnauthorizedError("You are not a project member");

    const userRole = membership.role;
    const channels = await this._channelRepo.findByProjectId(projectId);

    // Filter by visibility
    return channels.filter((c) => c.visibleToRoles.includes(userRole));
  }
}
