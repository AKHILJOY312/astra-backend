import { User } from "../../../domain/entities/user/User";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { IEmailService } from "../../ports/services/IEmailService";
import { RegisterUserDto } from "../../dto/auth/RegisterUserDto";
import crypto from "crypto";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { BadRequestError } from "@/application/error/AppError";
import { IRegisterUser } from "@/application/ports/use-cases/auth/IRegisterUserUseCase";

@injectable()
export class RegisterUser implements IRegisterUser {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
    @inject(TYPES.EmailService) private _emailSvc: IEmailService,
  ) {}

  async execute(dto: RegisterUserDto): Promise<{ message: string }> {
    if (!dto.name || !dto.email || !dto.password || !dto.confirmPassword)
      throw new BadRequestError("All fields are required");

    if (dto.password !== dto.confirmPassword)
      throw new BadRequestError("Passwords do not match");

    const existing = await this._userRepo.findByEmail(dto.email);
    if (existing)
      throw new BadRequestError("User Already Existed Login Instead");

    const hashed = await this._authSvc.hashPassword(dto.password);
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

    await this._userRepo.create(user);
    await this._emailSvc.sendVerification(dto.email, token);

    return {
      message:
        "User registered. Please check your email to verify your account.",
    };
  }
}
