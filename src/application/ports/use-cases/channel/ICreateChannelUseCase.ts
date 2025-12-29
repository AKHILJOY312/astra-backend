import {
  CreateChannelDTO,
  CreateChannelResponseDTO,
} from "@/application/dto/channel/channelDtos";

export interface ICreateChannelUseCase {
  execute(
    input: CreateChannelDTO
  ): Promise<{ channel: CreateChannelResponseDTO }>;
}
