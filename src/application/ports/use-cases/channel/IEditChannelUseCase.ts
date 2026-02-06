import {
  ChannelResponseDto,
  EditChannelDTO,
} from "@/application/dto/channel/channelDtos";

export interface IEditChannelUseCase {
  execute(input: EditChannelDTO): Promise<ChannelResponseDto | void>;
}
