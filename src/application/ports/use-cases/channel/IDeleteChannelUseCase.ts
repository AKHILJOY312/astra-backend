import { ChannelResponseDto } from "@/application/dto/channel/channelDtos";

export interface IDeleteChannelUseCase {
  execute(
    channelId: string,
    userId: string,
  ): Promise<ChannelResponseDto | null>;
}
