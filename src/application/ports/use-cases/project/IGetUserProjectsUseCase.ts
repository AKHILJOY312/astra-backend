import { Project } from "@/domain/entities/project/Project";

export interface GetUserProjectsDTO {
  userId: string;
  page: number;
  limit: number;
  search: string | undefined;
}

export interface GetUserProjectsResultDTO {
  projects: Project[];
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
}

export interface IGetUserProjectsUseCase {
  execute(input: GetUserProjectsDTO): Promise<GetUserProjectsResultDTO>;
}
