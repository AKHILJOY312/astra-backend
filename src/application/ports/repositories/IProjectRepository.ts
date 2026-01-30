// src/core/repositories/IProjectRepository.ts
import { Project } from "@/domain/entities/project/Project";
import { IBaseRepository } from "./IBaseRepository";

export interface IProjectRepository extends IBaseRepository<Project> {
  // create(project: Project): Promise<Project>;
  // update(project: Project): Promise<void>;
  // delete(id: string): Promise<Project | null>;
  // findById(id: string): Promise<Project | null>;

  findByOwnerId(ownerId: string): Promise<Project[]>;
  findPaginatedByUserId(input: {
    userId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    projects: Project[];
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  }>;

  countByOwnerId(ownerId: string): Promise<number>;
  existsByIdAndOwnerId(id: string, ownerId: string): Promise<boolean>;
  existsByNameAndOwnerId(
    projectName: string,
    ownerId: string,
  ): Promise<boolean>;
}
