// src/application/ports/useCases/IListMessagesUseCase.ts

import { Message } from "@/domain/entities/message/Message";

export interface ListMessagesInput {
  channelId: string;
  cursor?: string;
  limit?: number;
}

export interface MessageResponseDTO {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  text: string;
  hasAttachments: boolean;
  hasReplies: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  // Add replyCount, edited, etc. if needed later
}

export interface IListMessagesUseCase {
  execute(input: ListMessagesInput): Promise<Message[]>;
}
