// src/core/ports/useCases/ICreateChannelUseCase.ts

import { CreateChannelDTO } from "@/application/dto/channel/channelDtos";

export interface ChannelResponseDTO {
  id?: string;
  projectId: string;
  channelName: string;
  description?: string;
  createdBy: string;
  visibleToRoles: string[];
  permissionsByRole: Record<string, "view" | "message" | "manager">;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateChannelUseCase {
  execute(input: CreateChannelDTO): Promise<{ channel: ChannelResponseDTO }>;
}
