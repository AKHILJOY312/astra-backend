// src/application/ports/useCases/IBlockUserUseCase.ts

export interface BlockUserResponseDTO {
  id: string;
  name: string;
  email: string;
  status: "blocked" | "active";
}

export interface IBlockUserUseCase {
  execute(userId: string): Promise<BlockUserResponseDTO>;
}
