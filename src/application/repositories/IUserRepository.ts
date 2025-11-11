// src/domain/interfaces/IUserRepository.ts
import { User } from "../../domain/entities/user/User";

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;

  findByVerificationToken(token: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;

  create(user: User): Promise<User>;
  save(user: User): Promise<void>;
}
