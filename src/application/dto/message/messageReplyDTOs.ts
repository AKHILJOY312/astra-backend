export interface ListMessageRepliesInput {
  messageId: string;
  limit: number;
  cursor?: string;
}

export interface MessageReplyResponseDTO {
  id: string;
  parentMessageId: string;
  senderId: string;
  text: string;
  createdAt: string; // ISO string
}

export interface SendMessageReplyInputDTO {
  channelId: string;
  projectId: string;
  parentMessageId: string;
  senderId: string;
  text: string;
}
