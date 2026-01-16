// src/application/ports/repositories/IAttachmentRepository.ts
import { Attachment } from "@/domain/entities/message/Attachment";

export interface IAttachmentRepository {
  /**
   * Create one or multiple attachments linked to a message
   */
  createMany(attachments: Attachment[]): Promise<Attachment[]>;

  /**
   * Get all attachments for a specific message
   */
  findByMessageId(messageId: string): Promise<Attachment[]>;

  /**
   * Optional: Delete attachments of a message (when message is deleted)
   */
  deleteByMessageId(messageId: string): Promise<number>;

  /**
   * Optional: Get single attachment by ID
   */
  findById(attachmentId: string): Promise<Attachment | null>;
}
