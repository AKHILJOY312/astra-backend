// src/application/dtos/UpdateStatusDTO.ts

export interface UpdateStatusRequestDTO {
  status: 'active' | 'blocked'; // The new desired status
}

// Response can use UserDTO or a simplified message
export interface UpdateStatusResponseDTO {
  message: string;
  user: { id: string, name: string, email: string, status: 'active' | 'blocked' };
}
