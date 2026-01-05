import { Invitation } from "@/domain/entities/project/Invitation";

export interface IInvitationRepository {
  create(invitation: Invitation): Promise<Invitation>;

  findByToken(token: string): Promise<Invitation | null>;

  findByEmailAndProject(
    email: string,
    projectId: string
  ): Promise<Invitation | null>;

  findPendingByEmailAndProject(
    email: string,
    projectId: string
  ): Promise<Invitation | null>;

  countPendingByProject(projectId: string): Promise<number>;

  update(invitation: Invitation): Promise<void>;

  delete(id: string): Promise<void>;

  // Optional: for cleanup jobs
  //   findExpiredPending(limit?: number): Promise<Invitation[]>;
}
