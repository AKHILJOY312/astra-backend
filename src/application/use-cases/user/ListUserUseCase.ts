// src/application/usecases/ListUsersUseCase.ts
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import {
  UserListResponseDTO,
  UserDTO,
} from "../../dto/user/UserListResponseDTO";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IListUsersUseCase } from "@/application/ports/use-cases/user/IListUsersUseCase";

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
}

@injectable()
export class ListUsersUseCase implements IListUsersUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
  ) {}

  async execute(query: ListUsersQuery): Promise<UserListResponseDTO> {
    const result = await this._userRepo.findUsersWithPagination(query);

    const users: UserDTO[] = result.users.map((user) => ({
      id: user.id!,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      // NOTE: Assuming User entity has a 'status' or derive it from a new 'isBlocked' property
      // Since 'isBlocked' isn't on UserProps, we'll need to update the User entity
      status: user.isBlocked ? "blocked" : "active", // Assuming we add isBlocked to User
      createdAt: user.createdAt, // Assuming createdAt is available
    }));

    return {
      users,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    };
  }
}
