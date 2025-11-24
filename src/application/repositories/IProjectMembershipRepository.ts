// src/core/repositories/IProjectMembershipRepository.ts
import {
  ProjectMembership,
  ProjectRole,
} from "../../domain/entities/project/ProjectMembership";

export interface IProjectMembershipRepository {
  create(membership: ProjectMembership): Promise<ProjectMembership>;
  update(membership: ProjectMembership): Promise<void>;
  delete(id: string): Promise<ProjectMembership | null>;
  deleteByProjectAndUser(projectId: string, userId: string): Promise<void>;

  findById(id: string): Promise<ProjectMembership | null>;
  findByProjectAndUser(
    projectId: string,
    userId: string
  ): Promise<ProjectMembership | null>;
  findByProjectId(projectId: string): Promise<ProjectMembership[]>;
  findByUserId(userId: string): Promise<ProjectMembership[]>;

  countMembersInProject(projectId: string): Promise<number>;
  countManagersInProject(projectId: string): Promise<number>;

  existsManagerInProject(projectId: string, userId: string): Promise<boolean>;
}
