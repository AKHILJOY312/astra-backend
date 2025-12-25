import { Project } from "@/domain/entities/project/Project";

export interface CreateProjectDTO {
  projectName: string;
  description?: string;
  imageUrl?: string | null;
  ownerId: string;
}

export interface CreateProjectResultDTO {
  project: Project;
}

export interface ICreateProjectUseCase {
  execute(input: CreateProjectDTO): Promise<CreateProjectResultDTO>;
}
