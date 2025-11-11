import { MessageRepository } from '../../../application/repositories/MessageRepository';
import { Message } from '../../../domain/entities/message/Message';

export class MessageRepositoryImpl implements MessageRepository {
  private storage: Map<string, Message> = new Map();

  async save(entity: Message): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async findById(id: string): Promise<Message | null> {
    return this.storage.get(id) || null;
  }
}
