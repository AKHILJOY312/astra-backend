// src/core/ports/useCases/IEditChannelUseCase.ts
import { Channel } from "@/domain/entities/channel/Channel";
// import { ChannelResponseDTO } from "./ICreateChannelUseCase"; // Reuse the same response DTO

export interface EditChannelDTO {
  channelId: string;
  userId: string;
  channelName?: string;
  description?: string;
  visibleToRoles?: string[];
  permissionsByRole?: Record<string, "view" | "message" | "manager">;
}

export interface IEditChannelUseCase {
  execute(input: EditChannelDTO): Promise<Channel | void>;
}
