// src/infrastructure/persistence/mongoose/repositories/AttachmentRepository.ts
import { injectable } from "inversify";
import { Attachment } from "@/domain/entities/message/Attachment";
import { IAttachmentRepository } from "@/application/ports/repositories/IAttachmentRepository";
import { AttachmentModel, toAttachmentEntity } from "../models/AttachmentModel";
import { Types } from "mongoose";

@injectable()
export class AttachmentRepository implements IAttachmentRepository {
  async createMany(attachments: Attachment[]): Promise<Attachment[]> {
    if (attachments.length === 0) return [];

    const docsToCreate = [];

    for (const [index, att] of attachments.entries()) {
      try {
        const plain = att.toJSON();

        // Step 1: Validate required fields
        if (!plain.messageId) throw new Error("messageId missing");
        if (!plain.uploadedBy) throw new Error("uploadedBy missing");
        if (!plain.fileName) throw new Error("fileName missing");

        // Step 2: Convert ObjectId fields
        let messageIdObj;
        try {
          messageIdObj = new Types.ObjectId(plain.messageId);
        } catch (e) {
          throw new Error(`Invalid messageId: ${plain.messageId} → ${e}`);
        }

        let uploadedByObj;
        try {
          uploadedByObj = new Types.ObjectId(plain.uploadedBy);
        } catch (e) {
          throw new Error(`Invalid uploadedBy: ${plain.uploadedBy} → ${e}`);
        }

        // Step 3: Date
        const uploadedAtDate = new Date(plain.uploadedAt);
        if (isNaN(uploadedAtDate.getTime())) {
          throw new Error(`Invalid uploadedAt date: ${plain.uploadedAt}`);
        }

        // Step 4: Build
        const doc = {
          messageId: messageIdObj,
          uploadedBy: uploadedByObj,
          fileName: plain.fileName,
          fileType: plain.fileType,
          fileSize: plain.fileSize,
          fileUrl: plain.fileUrl,
          thumbnailUrl: plain.thumbnailUrl,
          uploadedAt: uploadedAtDate,
        };

        docsToCreate.push(doc);
      } catch (err) {
        console.error(`Failed processing attachment ${index}:`, err);
      }
    }

    try {
      const createdDocs = await AttachmentModel.insertMany(docsToCreate);

      return createdDocs.map(toAttachmentEntity);
    } catch (err) {
      console.error("insertMany failed with error:", err);
      throw err; // re-throw so upper layers can catch
    }
  }

  async findByMessageId(messageId: string): Promise<Attachment[]> {
    const docs = await AttachmentModel.find({
      messageId: new Types.ObjectId(messageId),
    }).sort({ uploadedAt: 1 });

    return docs.map(toAttachmentEntity);
  }

  async deleteByMessageId(messageId: string): Promise<number> {
    const result = await AttachmentModel.deleteMany({
      messageId: new Types.ObjectId(messageId),
    });
    return result.deletedCount || 0;
  }

  async findById(attachmentId: string): Promise<Attachment | null> {
    const doc = await AttachmentModel.findById(
      new Types.ObjectId(attachmentId),
    );
    return doc ? toAttachmentEntity(doc) : null;
  }
}
