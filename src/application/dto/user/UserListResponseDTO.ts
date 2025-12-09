// src/application/dtos/UserListResponseDTO.ts

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  isVerified: boolean;
  isAdmin: boolean;
  // A new status field is needed for Block/Unblock logic
  status: "active" | "blocked";
  createdAt: Date | undefined;
}

export interface UserListResponseDTO {
  users: UserDTO[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
