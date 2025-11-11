import { UserRepository } from '../../../application/repositories/UserRepository';
import { User } from '../../../domain/entities/user/User';

export class UserRepositoryImpl implements UserRepository {
  private storage: Map<string, User> = new Map();

  async save(entity: User): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async findById(id: string): Promise<User | null> {
    return this.storage.get(id) || null;
  }
}
