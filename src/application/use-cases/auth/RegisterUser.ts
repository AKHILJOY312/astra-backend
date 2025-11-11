// src/application/use-cases/RegisterUser.ts
import { User } from "../../../domain/entities/user/User";
import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { IAuthService } from "../../../application/services/IAuthService";
import { IEmailService } from "../../../application/services/IEmailService";
import { RegisterUserDto } from "../../dto/RegisterUserDto";
import crypto from "crypto";

export class RegisterUser {
  constructor(
    private userRepo: IUserRepository,
    private auth: IAuthService,
    private email: IEmailService
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ message: string }> {
    if (!dto.name || !dto.email || !dto.password || !dto.confirmPassword)
      throw new Error("All fields are required");

    if (dto.password !== dto.confirmPassword)
      throw new Error("Passwords do not match");

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new Error("User already exists");

    const hashed = await this.auth.hashPassword(dto.password);
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000); // 1h

    const user = new User({
      name: dto.name,
      email: dto.email,
      password: hashed,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: expires,
    });

    await this.userRepo.create(user);
    await this.email.sendVerification(dto.email, token);

    return {
      message:
        "User registered. Please check your email to verify your account.",
    };
  }
}
