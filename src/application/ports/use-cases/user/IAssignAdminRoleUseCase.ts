// src/application/ports/useCases/IAssignAdminRoleUseCase.ts

export interface AdminRoleResponseDTO {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface IAssignAdminRoleUseCase {
  execute(userId: string): Promise<AdminRoleResponseDTO>;
}
