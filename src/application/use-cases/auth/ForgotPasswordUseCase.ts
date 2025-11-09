// // application/use-cases/auth/ForgotPasswordUseCase.ts
// import { UserRepository } from "../../../domain/repositories/UserRepository";
// import { EmailService } from "../../../frameworks/email/EmailService";
// import crypto from "crypto";

// export class ForgotPasswordUseCase {
//   constructor(
//     private userRepo: UserRepository,
//     private emailService: EmailService
//   ) {}

//   async execute(email: string) {
//     const user = await this.userRepo.findByEmail(email);
//     if (!user) throw new Error("No account with that email");

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const resetTokenExpires = Date.now() + 3600000; // 1 hour

//     await this.userRepo.update(user.id, {
//       resetPasswordToken: resetToken,
//       resetPasswordExpires: resetTokenExpires,
//     });

//     const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
//     await this.emailService.sendPasswordReset(email, resetUrl);
//   }
// }
