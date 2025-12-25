export interface UserLimitsDTO {
  currentProjects: number;
  maxProjects: number;
  currentMembersInProject?: number; // per project
  maxMembersPerProject: number;
  planType: string;
  canCreateProject: boolean;
  canAddMember: boolean;
}

export interface IGetUserLimitsUseCase {
  execute(userId: string, projectId?: string): Promise<UserLimitsDTO>;
}
