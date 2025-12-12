// src/core/repositories/IProjectRepository.ts
import { Project } from "../../../domain/entities/project/Project";

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  update(project: Project): Promise<void>;
  delete(id: string): Promise<Project | null>;
  findById(id: string): Promise<Project | null>;
  findByOwnerId(ownerId: string): Promise<Project[]>;
  findAllByUserId(userId: string): Promise<Project[]>; // projects user is member of
  countByOwnerId(ownerId: string): Promise<number>;
  existsByIdAndOwnerId(id: string, ownerId: string): Promise<boolean>;
}
