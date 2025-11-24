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
//Admin Auth
import { AdminLogin } from "../application/use-cases/auth/admin/AdminLogin";
import { AdminForgotPassword } from "../application/use-cases/auth/admin/AdminForgotPassword";
import { AdminResetPassword } from "../application/use-cases/auth/admin/AdminResetPassword";
import { AdminAuthController } from "../interface-adapters/controllers/auth/AdminAuthController";

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

//_______________________________________________________________
const adminLogin = new AdminLogin(userRepo, authSvc);
const adminForgotPassword = new AdminForgotPassword(userRepo, emailSvc);
const adminResetPassword = new AdminResetPassword(userRepo, authSvc);

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

export const adminAuthController = new AdminAuthController(
  adminLogin,
  adminForgotPassword,
  adminResetPassword
);

export const planController = new PlanController(
  createPlan,
  updatePlan,
  deletePlan,
  getPlansPaginated
);

// src/config/container.ts (continue after your existing code)

// ==================== PROJECT & CHANNEL & SUBSCRIPTION ====================

import { ProjectRepository } from "../infra/db/mongoose/repositories/ProjectRepository";
import { ProjectMembershipRepository } from "../infra/db/mongoose/repositories/ProjectMembershipRepository";
import { ChannelRepository } from "../infra/db/mongoose/repositories/ChannelRepository";
import { UserSubscriptionRepository } from "../infra/db/mongoose/repositories/UserSubscriptionRepository";

import { CreateProjectUseCase } from "../application/use-cases/project/CreateProjectUseCase";
import { AddMemberToProjectUseCase } from "../application/use-cases/project/AddMemberToProjectUseCase";
import { RemoveMemberFromProjectUseCase } from "../application/use-cases/project/RemoveMemberFromProjectUseCase";
import { ChangeMemberRoleUseCase } from "../application/use-cases/project/ChangeMemberRoleUseCase";
import { CreateChannelUseCase } from "../application/use-cases/channel/CreateChannelUseCase";
import { GetUserLimitsUseCase } from "../application/use-cases/upgradetopremium/GetUserLimitsUseCase";
import { UpgradeSubscriptionUseCase } from "../application/use-cases/upgradetopremium/UpgradeSubscriptionUseCase";

import { ProjectController } from "../interface-adapters/controllers/project/ProjectController";
import { MemberController } from "../interface-adapters/controllers/project/MemberController";
import { ChannelController } from "../interface-adapters/controllers/channel/ChannelController";
import { SubscriptionController } from "../interface-adapters/controllers/plan/SubscriptionController";

// Repositories
const projectRepo = new ProjectRepository();
const membershipRepo = new ProjectMembershipRepository();
const channelRepo = new ChannelRepository();
const userSubRepo = new UserSubscriptionRepository();

// Use Cases
const createProjectUC = new CreateProjectUseCase(
  projectRepo,
  userSubRepo,
  planRepo
);
const addMemberUC = new AddMemberToProjectUseCase(
  membershipRepo,
  projectRepo,
  userSubRepo,
  planRepo
);
const removeMemberUC = new RemoveMemberFromProjectUseCase(membershipRepo);
const changeRoleUC = new ChangeMemberRoleUseCase(membershipRepo);
const createChannelUC = new CreateChannelUseCase(channelRepo, membershipRepo);
const getLimitsUC = new GetUserLimitsUseCase(
  projectRepo,
  membershipRepo,
  userSubRepo,
  planRepo
);
const upgradeSubUC = new UpgradeSubscriptionUseCase(userSubRepo, planRepo);

// Controllers
export const projectController = new ProjectController(createProjectUC);
export const memberController = new MemberController(
  addMemberUC,
  removeMemberUC,
  changeRoleUC
);
export const channelController = new ChannelController(createChannelUC);
export const subscriptionController = new SubscriptionController(
  upgradeSubUC,
  getLimitsUC
);
