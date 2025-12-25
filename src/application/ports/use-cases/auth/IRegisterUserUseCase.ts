// src/application/ports/useCases/IRegisterUser.ts
import { RegisterUserDto } from "@/application/dto/RegisterUserDto";

export interface IRegisterUser {
  execute(dto: RegisterUserDto): Promise<{ message: string }>;
}
