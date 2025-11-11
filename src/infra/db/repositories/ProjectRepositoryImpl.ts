import { ProjectRepository } from '../../../application/repositories/ProjectRepository';
import { Project } from '../../../domain/entities/project/Project';

export class ProjectRepositoryImpl implements ProjectRepository {
  private storage: Map<string, Project> = new Map();

  async save(entity: Project): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async findById(id: string): Promise<Project | null> {
    return this.storage.get(id) || null;
  }
}
