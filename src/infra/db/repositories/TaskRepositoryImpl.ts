import { TaskRepository } from '../../../application/repositories/TaskRepository';
import { Task } from '../../../domain/entities/task/Task';

export class TaskRepositoryImpl implements TaskRepository {
  private storage: Map<string, Task> = new Map();

  async save(entity: Task): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async findById(id: string): Promise<Task | null> {
    return this.storage.get(id) || null;
  }
}
