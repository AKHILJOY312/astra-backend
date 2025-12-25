// src/application/ports/useCases/IUpdateUserProfileUseCase.ts

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
}

export interface UpdateProfileResponseDTO {
  id: string | undefined;
  name: string;
  email: string;
  isVerified: boolean;
}

export interface IUpdateUserProfileUseCase {
  execute(
    userId: string,
    dto: UpdateProfileDTO
  ): Promise<UpdateProfileResponseDTO>;
}
