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

export interface SendMessageInput {
  projectId: string;
  channelId: string;
  senderId: string;
  text: string;
  attachments?: AttachmentInput[];
}
export interface AttachmentInput {
  fileName: string;
  fileType: string; // mime type
  fileSize: number;
  fileUrl: string; // permanent public/signed URL
  key: string; // s3 key for future management
  thumbnailUrl?: string; // optional
}
