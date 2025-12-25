// src/core/use-cases/project/GetUserProjectsUseCase.ts
import { inject, injectable } from "inversify";
import { IProjectRepository } from "../../ports/repositories/IProjectRepository";
import { TYPES } from "@/config/types";
import {
  GetUserProjectsDTO,
  GetUserProjectsResultDTO,
  IGetUserProjectsUseCase,
} from "@/application/ports/use-cases/project/IGetUserProjectsUseCase";

@injectable()
export class GetUserProjectsUseCase implements IGetUserProjectsUseCase {
  constructor(
    @inject(TYPES.ProjectRepository) private projectRepo: IProjectRepository
  ) {}

  async execute(input: GetUserProjectsDTO): Promise<GetUserProjectsResultDTO> {
    const { userId, page, limit, search } = input;

    // Fetch projects where user is owner or member
    const result = await this.projectRepo.findPaginatedByUserId({
      userId,
      page,
      limit,
      search,
    });

    return result;
  }
}
