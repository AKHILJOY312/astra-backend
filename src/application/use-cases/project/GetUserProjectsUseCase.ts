// src/core/use-cases/project/GetUserProjectsUseCase.ts
import { inject, injectable } from "inversify";
import { Project } from "../../../domain/entities/project/Project";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { TYPES } from "@/config/types";

export interface GetUserProjectsDTO {
  userId: string;
}

export interface GetUserProjectsResultDTO {
  projects: Project[];
}

@injectable()
export class GetUserProjectsUseCase {
  constructor(
    @inject(TYPES.ProjectRepository) private projectRepo: IProjectRepository
  ) {}

  async execute(input: GetUserProjectsDTO): Promise<GetUserProjectsResultDTO> {
    const { userId } = input;

    // Fetch projects where user is owner or member
    const projects = await this.projectRepo.findAllByUserId(userId);

    return { projects };
  }
}
