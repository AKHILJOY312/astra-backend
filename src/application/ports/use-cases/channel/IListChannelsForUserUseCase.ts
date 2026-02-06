import { Channel } from "@/domain/entities/channel/Channel";

export interface IListChannelsForUserUseCase {
  execute(projectId: string, userId: string): Promise<Channel[]>;
}
