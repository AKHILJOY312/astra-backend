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
    console.log("1. Token:", token);
    console.log("2. Password:", password?.length > 0 ? "exists" : "missing");

    if (!token) throw new Error("Invalid token");
    if (!password || !confirmPassword)
      throw new Error("Both passwords are required");
    if (password !== confirmPassword) throw new Error("Passwords do not match");
    console.log("3. Finding user by reset token...");
    const user = await this.userRepo.findByResetToken(token);
    console.log("4. User found:", !!user);
    if (!user) throw new Error("Invalid or expired token");
    console.log("5. Hashing password...");
    const hashed = await this.auth.hashPassword(password);
    console.log("6. Hashed:", hashed?.slice(0, 10) + "...");
    // Update password via the entity (keeps encapsulation)
    // Here we bypass the entity setter for brevity – you can add one if you want.

    user.setPassword(hashed);
    console.log("Starting to use clearResetTOken");
    user.clearResetToken();
    console.log("SAVE START");
    await this.userRepo.save(user);
    console.log("SAVE END");

    return { message: "Password reset successfully" };
  }
}
