import { ChannelRepository } from '../../../application/repositories/ChannelRepository';
import { Channel } from '../../../domain/entities/channel/Channel';

export class ChannelRepositoryImpl implements ChannelRepository {
  private storage: Map<string, Channel> = new Map();

  async save(entity: Channel): Promise<void> {
    this.storage.set(entity.id, entity);
  }

  async findById(id: string): Promise<Channel | null> {
    return this.storage.get(id) || null;
  }
}
