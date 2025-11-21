// src/application/use-cases/admin/AdminLogin.ts
import { IUserRepository } from "../../../repositories/IUserRepository";
import { IAuthService } from "../../../services/IAuthService";

export class AdminLogin {
  constructor(
    private userRepo: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    if (!user.isAdmin) {
      throw new Error("Access denied. Admins only.");
    }

    const isValid = await this.authService.comparePassword(
      password,
      user.password
    );
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = this.authService.generateAccessToken(
      user.id!,
      user.email
    );

    return {
      accessToken,
      user: {
        id: user.id!,
        email: user.email,
        name: user.name,
        isAdmin: true,
      },
    };
  }
}
