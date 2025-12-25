// src/application/ports/useCases/ISendMessageUseCase.ts

import { Message } from "@/domain/entities/message/Message";
// import { MessageResponseDTO } from "./IListMessagesUseCase";

export interface SendMessageInput {
  projectId: string;
  channelId: string;
  senderId: string;
  text: string;
  attachments?: boolean;
}

export interface ISendMessageUseCase {
  execute(input: SendMessageInput): Promise<Message>;
}
