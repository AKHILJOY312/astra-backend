import { ProjectMemberView } from "@/application/dto/project/ProjectMemberView";

export interface ListProjectMembersDTO {
  projectId: string;
  requestedBy: string;
}

export interface IListProjectMembersUseCase {
  execute(input: ListProjectMembersDTO): Promise<ProjectMemberView[]>;
}
