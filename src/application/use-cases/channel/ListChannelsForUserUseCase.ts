// src/core/use-cases/channel/ListChannelsForUserUseCase.ts

import { inject, injectable } from "inversify";
import { IChannelRepository } from "../../ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "../../ports/repositories/IProjectMembershipRepository";
import { TYPES } from "@/config/types";

@injectable()
export class ListChannelsForUserUseCase {
  constructor(
    @inject(TYPES.ChannelRepository) private channelRepo: IChannelRepository,
    @inject(TYPES.ProjectMembershipRepository)
    private membershipRepo: IProjectMembershipRepository
  ) {}

  async execute(projectId: string, userId: string) {
    const membership = await this.membershipRepo.findByProjectAndUser(
      projectId,
      userId
    );
    if (!membership) throw new Error("You are not a project member");

    const userRole = membership.role;

    const channels = await this.channelRepo.findByProjectId(projectId);

    // Filter by visibility
    return channels.filter((c) => c.visibleToRoles.includes(userRole));
  }
}
