import { ListMessagesInput } from "@/application/dto/message/messageDtos";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IListMessagesUseCase } from "@/application/ports/use-cases/message/IListMessagesUseCase";
import { TYPES } from "@/config/di/types";
import { inject, injectable } from "inversify";

@injectable()
export class ListMessagesUseCase implements IListMessagesUseCase {
  constructor(
    @inject(TYPES.MessageRepository) private _messageRepo: IMessageRepository,
  ) {}

  async execute(input: ListMessagesInput) {
    return this._messageRepo.listByChannel(
      input.channelId,
      input.cursor,
      input.limit,
    );
  }
}
