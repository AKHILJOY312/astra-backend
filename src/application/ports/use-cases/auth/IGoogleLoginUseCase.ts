// src/application/ports/useCases/IGoogleLogin.ts
import { User } from "@/domain/entities/user/User";
export interface GoogleProfile {
  id?: string;
  name?: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
  isAdmin?: boolean;
}

export interface IGoogleLogin {
  execute(profile: GoogleProfile): Promise<{
    user: User; // or you can use a DTO instead of domain entity
    accessToken: string;
    refreshToken: string;
  }>;
}
