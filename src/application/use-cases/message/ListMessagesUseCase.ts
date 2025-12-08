import { IMessageRepository } from "@/application/repositories/IMessageRepository";

export class ListMessagesUseCase {
  constructor(private repo: IMessageRepository) {}

  async execute(input: { channelId: string; cursor?: string; limit?: number }) {
    return this.repo.listByChannel(input.channelId, input.cursor, input.limit);
  }
}
