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
import { GoogleLogin } from "../application/use-cases/auth/GoogleLogin";

//Plan
import { PlanRepository } from "../infra/db/mongoose/repositories/PlanRepository";
import { CreatePlan } from "../application/use-cases/billing/plan/CreatePlan";
import { UpdatePlan } from "../application/use-cases/billing/plan/UpdatePlan";
import { SoftDeletePlan } from "../application/use-cases/billing/plan/SoftDeletePlan";
import { GetPlansPaginated } from "../application/use-cases/billing/plan/GetPlansPaginated";
import { PlanController } from "../interface-adapters/controllers/plan/PlanController";

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
const googleLoginUC = new GoogleLogin(userRepo, authSvc);

//__________________________Plan__________________________________
const planRepo = new PlanRepository();
const createPlan = new CreatePlan(planRepo);
const updatePlan = new UpdatePlan(planRepo);
const deletePlan = new SoftDeletePlan(planRepo);
const getPlansPaginated = new GetPlansPaginated(planRepo);
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
  verifyResetUC,
  googleLoginUC
);

export const planController = new PlanController(
  createPlan,
  updatePlan,
  deletePlan,
  getPlansPaginated
);
