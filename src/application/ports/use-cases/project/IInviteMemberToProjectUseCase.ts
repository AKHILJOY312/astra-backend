import {
  ProjectMembership,
  // ProjectRole,
} from "@/domain/entities/project/ProjectMembership";

export interface InviteMemberDTO {
  projectId: string;
  newMemberEmail: string;
  role?: "member" | "manager" | "lead";
  requestedBy: string; // userId of the manager sending the invite
}

export type InviteMemberResultDTO =
  | { type: "added"; membership: ProjectMembership }
  | { type: "invited"; invitationId: string; email: string };

export interface IInviteMemberToProjectUseCase {
  execute(input: InviteMemberDTO): Promise<InviteMemberResultDTO>;
}
//---------------------------------------------
// export interface AddMemberDTO {
//   projectId: string;
//   userId: string;
//   role?: ProjectRole;
//   requestedBy: string;
// }

// export interface AddMemberResultDTO {
//   membership: ProjectMembership;
// }

// export interface IInviteMemberToProjectUseCase {
//   execute(input: AddMemberDTO): Promise<AddMemberResultDTO>;
// }
