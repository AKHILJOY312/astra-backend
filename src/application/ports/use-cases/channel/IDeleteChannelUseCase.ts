import { Channel } from "@/domain/entities/channel/Channel";

// src/core/ports/useCases/IDeleteChannelUseCase.ts
export interface IDeleteChannelUseCase {
  execute(channelId: string, userId: string): Promise<Channel | null>;
}
