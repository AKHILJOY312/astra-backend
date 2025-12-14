// src/domain/interfaces/IUserRepository.ts
import { User } from "../../../domain/entities/user/User";
import { ListUsersQuery } from "../../use-cases/user/ListUserUseCase";

export interface PaginationResult {
  users: User[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;

  findByVerificationToken(token: string): Promise<User | null>;
  findByResetToken(token: string): Promise<User | null>;

  create(user: User): Promise<User>;
  save(user: User): Promise<void>;

  countAdmins(): Promise<number>;
  findUsersWithPagination(query: ListUsersQuery): Promise<PaginationResult>;

  // Optional: Specific methods for direct updates (alternative to using generic save)
  updateStatus(userId: string): Promise<void>;
  updateRole(userId: string): Promise<void>;
  updateSecurityStamp(userId: string, stamp: string): Promise<void>;
}
