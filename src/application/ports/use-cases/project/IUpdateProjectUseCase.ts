import { Project } from "@/domain/entities/project/Project";

export interface UpdateProjectDTO {
  projectId: string;
  userId: string;
  projectName?: string;
  description?: string;
  imageUrl?: string | null;
}

export interface UpdateProjectResultDTO {
  project: Project;
}

export interface IUpdateProjectUseCase {
  execute(input: UpdateProjectDTO): Promise<UpdateProjectResultDTO>;
}
