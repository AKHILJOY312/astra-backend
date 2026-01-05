import {
  ProjectMembership,
  ProjectRole,
} from "@/domain/entities/project/ProjectMembership";

export interface AddMemberDTO {
  projectId: string;
  userId: string;
  role?: ProjectRole;
  requestedBy: string;
}

export interface AddMemberResultDTO {
  membership: ProjectMembership;
}

export interface IInviteMemberToProjectUseCase {
  execute(input: AddMemberDTO): Promise<AddMemberResultDTO>;
}
