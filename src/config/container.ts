// src/container.ts
import { AuthController } from "../interface-adapters/controllers/auth/AuthController";
import { ForgotPassword } from "../application/use-cases/auth/ForgotPassword";
import { GetMe } from "../application/use-cases/auth/GetMe";
import { JwtAuthService } from "../infra/auth/JwtAuthService";
import { LoginUser } from "../application/use-cases/auth/LoginUser";
import { LogoutUser } from "../application/use-cases/auth/LogoutUser";
import { NodemailerEmailService } from "../infra/email/NodemailerEmailService";
import { RefreshToken } from "../application/use-cases/auth/RefreshToken";
import { RegisterUser } from "../application/use-cases/auth/RegisterUser";
import { ResetPassword } from "../application/use-cases/auth/ResetPassword";
import { UserRepository } from "../infra/db/mongoose/repositories/UserRepository";
import { VerifyEmail } from "../application/use-cases/auth/VerifyEmail";
import { VerifyResetToken } from "../application/use-cases/auth/VerifyResetToken";
import { createProtectMiddleware } from "../infra/middleware/protect";

const userRepo = new UserRepository();
const authSvc = new JwtAuthService();
const emailSvc = new NodemailerEmailService();

const registerUC = new RegisterUser(userRepo, authSvc, emailSvc);
const verifyEmailUC = new VerifyEmail(userRepo);
const loginUC = new LoginUser(userRepo, authSvc);
const refreshUC = new RefreshToken(userRepo, authSvc);
const logoutUC = new LogoutUser();
const meUC = new GetMe(userRepo);
const forgotUC = new ForgotPassword(userRepo, emailSvc);
const resetUC = new ResetPassword(userRepo, authSvc);
const verifyResetUC = new VerifyResetToken(userRepo);
export const protect = createProtectMiddleware(userRepo);

export const authController = new AuthController(
  registerUC,
  verifyEmailUC,
  loginUC,
  refreshUC,
  logoutUC,
  meUC,
  forgotUC,
  resetUC,
  verifyResetUC
);
