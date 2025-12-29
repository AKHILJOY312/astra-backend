import { AdminLoginResponseDTO } from "@/application/dto/auth/authDtos";

export interface IAdminLogin {
  execute(email: string, password: string): Promise<AdminLoginResponseDTO>;
}
