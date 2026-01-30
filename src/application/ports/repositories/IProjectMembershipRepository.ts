// src/core/repositories/IProjectMembershipRepository.ts
import { ProjectMemberView } from "@/application/dto/project/ProjectMemberView";
import { ProjectMembership } from "@/domain/entities/project/ProjectMembership";
import { IBaseRepository } from "./IBaseRepository";

export interface IProjectMembershipRepository extends IBaseRepository<ProjectMembership> {
  // create(membership: ProjectMembership): Promise<ProjectMembership>;
  // update(membership: ProjectMembership): Promise<void>;
  // delete(id: string): Promise<ProjectMembership | null>;
  // findById(id: string): Promise<ProjectMembership | null>;

  deleteByProjectAndUser(projectId: string, userId: string): Promise<void>;
  findByProjectAndUser(
    projectId: string,
    userId: string,
  ): Promise<ProjectMembership | null>;
  findByProjectId(projectId: string): Promise<ProjectMembership[]>;
  findByUserId(userId: string): Promise<ProjectMembership[]>;

  countMembersInProject(projectId: string): Promise<number>;
  countManagersInProject(projectId: string): Promise<number>;

  existsManagerInProject(projectId: string, userId: string): Promise<boolean>;
  findMembersWithUserDetails(projectId: string): Promise<ProjectMemberView[]>;
}
