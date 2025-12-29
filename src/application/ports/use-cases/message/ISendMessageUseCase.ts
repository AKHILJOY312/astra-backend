// src/application/ports/useCases/ISendMessageUseCase.ts

import { SendMessageInput } from "@/application/dto/message/messageDtos";
import { Message } from "@/domain/entities/message/Message";
// import { MessageResponseDTO } from "./IListMessagesUseCase";

export interface ISendMessageUseCase {
  execute(input: SendMessageInput): Promise<Message>;
}
