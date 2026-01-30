// src/application/ports/useCases/IRegisterUser.ts
import { RegisterUserDto } from "@/application/dto/auth/RegisterUserDto";

export interface IRegisterUser {
  execute(dto: RegisterUserDto): Promise<{ message: string }>;
}
