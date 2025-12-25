import { UserListResponseDTO } from "@/application/dto/user/UserListResponseDTO";

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
}

export interface IListUsersUseCase {
  execute(query: ListUsersQuery): Promise<UserListResponseDTO>;
}
