// src/core/ports/useCases/IEditChannelUseCase.ts
import { EditChannelDTO } from "@/application/dto/channel/channelDtos";
import { Channel } from "@/domain/entities/channel/Channel";
// import { ChannelResponseDTO } from "./ICreateChannelUseCase"; // Reuse the same response DTO

export interface IEditChannelUseCase {
  execute(input: EditChannelDTO): Promise<Channel | void>;
}
