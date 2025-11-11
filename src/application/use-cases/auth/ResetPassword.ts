// src/application/use-cases/ResetPassword.ts
import { IUserRepository } from "../../repositories/IUserRepository";
import { IAuthService } from "../../services/IAuthService";

export class ResetPassword {
  constructor(private userRepo: IUserRepository, private auth: IAuthService) {}

  async execute(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<{ message: string }> {
    if (!token) throw new Error("Invalid token");
    if (!password || !confirmPassword)
      throw new Error("Both passwords are required");
    if (password !== confirmPassword) throw new Error("Passwords do not match");

    const user = await this.userRepo.findByResetToken(token);
    if (!user) throw new Error("Invalid or expired token");

    const hashed = await this.auth.hashPassword(password);
    // Update password via the entity (keeps encapsulation)
    // Here we bypass the entity setter for brevity – you can add one if you want.
    // @ts-ignore – we know password is part of props
    user["password"] = hashed;
    user.clearResetToken();
    await this.userRepo.save(user);

    return { message: "Password reset successfully" };
  }
}
