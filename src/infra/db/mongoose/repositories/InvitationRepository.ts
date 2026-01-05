import { injectable } from "inversify";
import { Invitation } from "@/domain/entities/project/Invitation";
import { IInvitationRepository } from "@/application/ports/repositories/IInvitationRepository";
import {
  IInvitationDocument,
  InvitationModel,
  InvitationStatus,
} from "../models/InvitationModal";

@injectable()
export class InvitationRepository implements IInvitationRepository {
  // Helper: convert DB document to Domain entity
  private toDomain(doc: IInvitationDocument): Invitation {
    return new Invitation({
      id: doc.invitationId, // Now safe — comes from virtual
      projectId: doc.projectId,
      email: doc.email,
      role: doc.role,
      inviterId: doc.inviterId,
      token: doc.token,
      status: doc.status as InvitationStatus,
      createdAt: doc.createdAt,
      expiresAt: doc.expiresAt,
    });
  }

  private toPersistence(invitation: Invitation): Partial<IInvitationDocument> {
    return {
      projectId: invitation.projectId,
      email: invitation.email,
      role: invitation.role,
      inviterId: invitation.inviterId,
      token: invitation.token,
      status: invitation.status,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
    };
  }

  async create(invitation: Invitation): Promise<Invitation> {
    const doc = new InvitationModel({
      invitationId: invitation.id,
      ...this.toPersistence(invitation),
    });
    await doc.save();
    return invitation; // Already constructed with ID and defaults
  }

  async findByToken(token: string): Promise<Invitation | null> {
    const doc = await InvitationModel.findOne({ token });
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmailAndProject(
    email: string,
    projectId: string
  ): Promise<Invitation | null> {
    const doc = await InvitationModel.findOne({
      email: email.toLowerCase(),
      projectId,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findPendingByEmailAndProject(
    email: string,
    projectId: string
  ): Promise<Invitation | null> {
    const doc = await InvitationModel.findOne({
      email: email.toLowerCase(),
      projectId,
      status: "pending",
    });
    return doc ? this.toDomain(doc) : null;
  }

  async countPendingByProject(projectId: string): Promise<number> {
    return InvitationModel.countDocuments({
      projectId,
      status: "pending",
    });
  }

  async update(invitation: Invitation): Promise<void> {
    await InvitationModel.findOneAndUpdate(
      { invitationId: invitation.id },
      this.toPersistence(invitation),
      { runValidators: true }
    );
  }

  async delete(id: string): Promise<void> {
    await InvitationModel.deleteOne({ invitationId: id });
  }

  // Optional: for background expiration job
  async findExpiredPending(limit = 100): Promise<Invitation[]> {
    const docs = await InvitationModel.find({
      status: "pending",
      expiresAt: { $lt: new Date() },
    })
      .limit(limit)
      .exec();

    return docs.map((doc) => this.toDomain(doc));
  }
}
