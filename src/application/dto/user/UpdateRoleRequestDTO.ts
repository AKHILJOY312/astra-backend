// src/application/dtos/UpdateRoleDTO.ts

export interface UpdateRoleRequestDTO {
  isAdmin: boolean; 
}

// Response can use UserDTO or a simplified message
export interface UpdateRoleResponseDTO {
  message: string;
  user: { id: string, name: string, email: string, isAdmin: boolean };
}
