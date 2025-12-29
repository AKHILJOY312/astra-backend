// src/application/ports/useCases/IListMessagesUseCase.ts

import { ListMessagesInput } from "@/application/dto/message/messageDtos";
import { Message } from "@/domain/entities/message/Message";

export interface IListMessagesUseCase {
  execute(input: ListMessagesInput): Promise<Message[]>;
}
