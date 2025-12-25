import { User } from "../../../domain/entities/user/User";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { IEmailService } from "../../ports/services/IEmailService";
import { RegisterUserDto } from "../../dto/RegisterUserDto";
import crypto from "crypto";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { BadRequestError } from "@/application/error/AppError";
import { IRegisterUser } from "@/application/ports/use-cases/auth/IRegisterUserUseCase";

@injectable()
export class RegisterUser implements IRegisterUser {
  constructor(
    @inject(TYPES.UserRepository) private userRepo: IUserRepository,
    @inject(TYPES.AuthService) private auth: IAuthService,
    @inject(TYPES.EmailService) private email: IEmailService
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ message: string }> {
    if (!dto.name || !dto.email || !dto.password || !dto.confirmPassword)
      throw new BadRequestError("All fields are required");

    if (dto.password !== dto.confirmPassword)
      throw new BadRequestError("Passwords do not match");

    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing)
      throw new BadRequestError("User Already Existed Login Instead");

    const hashed = await this.auth.hashPassword(dto.password);
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3_600_000); // 1h

    const user = new User({
      name: dto.name,
      email: dto.email,
      password: hashed,
      isVerified: false,
      isAdmin: false,
      isBlocked: false,
      verificationToken: token,
      verificationTokenExpires: expires,
      securityStamp: token,
    });

    await this.userRepo.create(user);
    await this.email.sendVerification(dto.email, token);

    return {
      message:
        "User registered. Please check your email to verify your account.",
    };
  }
}
