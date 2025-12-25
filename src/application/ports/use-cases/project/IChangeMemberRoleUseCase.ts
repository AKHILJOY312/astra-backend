import {
  ProjectMembership,
  ProjectRole,
} from "@/domain/entities/project/ProjectMembership";

export interface ChangeMemberRoleDTO {
  projectId: string;
  memberId: string; // userId to change role
  newRole: ProjectRole;
  requestedBy: string; // who is changing (must be manager)
}

export interface ChangeMemberRoleResultDTO {
  membership: ProjectMembership;
}

export interface IChangeMemberRoleUseCase {
  execute(input: ChangeMemberRoleDTO): Promise<ChangeMemberRoleResultDTO>;
}
