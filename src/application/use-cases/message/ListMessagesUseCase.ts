import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { TYPES } from "@/config/types";
import { inject, injectable } from "inversify";

@injectable()
export class ListMessagesUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private repo: IMessageRepository
  ) {}

  async execute(input: { channelId: string; cursor?: string; limit?: number }) {
    return this.repo.listByChannel(input.channelId, input.cursor, input.limit);
  }
}
