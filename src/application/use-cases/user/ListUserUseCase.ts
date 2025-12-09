// src/application/usecases/ListUsersUseCase.ts
import { IUserRepository } from "../../repositories/IUserRepository";
import {
  UserListResponseDTO,
  UserDTO,
} from "../../dto/user/UserListResponseDTO";

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
}

export class ListUsersUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(query: ListUsersQuery): Promise<UserListResponseDTO> {
    console.log("ListUsersUseCase: execute called with", query);
    const result = await this.userRepo.findUsersWithPagination(query);
    console.log("ListUsersUseCase: fetched users", result);

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
