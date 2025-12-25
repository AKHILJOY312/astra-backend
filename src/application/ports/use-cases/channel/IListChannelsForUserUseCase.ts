// src/core/ports/useCases/IListChannelsForUserUseCase.ts
import { Channel } from "@/domain/entities/channel/Channel";
// import { ChannelResponseDTO } from "./ICreateChannelUseCase"; // Reuse

export interface IListChannelsForUserUseCase {
  execute(projectId: string, userId: string): Promise<Channel[]>;
}
