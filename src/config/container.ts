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
import { CreatePlan } from "../application/use-cases/plan/admin/CreatePlan";
import { UpdatePlan } from "../application/use-cases/plan/admin/UpdatePlan";
import { SoftDeletePlan } from "../application/use-cases/plan/admin/SoftDeletePlan";
import { GetPlansPaginated } from "../application/use-cases/plan/admin/GetPlansPaginated";
import { PlanController } from "../interface-adapters/controllers/plan/PlanController";

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
import { UpgradeToPlanUseCase } from "../application/use-cases/upgradetopremium/UpgradeToPlanUseCase";

import { ProjectController } from "../interface-adapters/controllers/project/ProjectController";
import { MemberController } from "../interface-adapters/controllers/project/MemberController";
import { ChannelController } from "../interface-adapters/controllers/channel/ChannelController";
import { SubscriptionController } from "../interface-adapters/controllers/plan/SubscriptionController";
import { UserService } from "../application/services/UserService";
import { GetUserProjectsUseCase } from "../application/use-cases/project/GetUserProjectsUseCase";
import { GetAvailablePlansUseCase } from "../application/use-cases/plan/user/GetAvailablePlansUseCase";
import { RazorpayService } from "@/infra/payment/RazorpayService";
import { CapturePaymentUseCase } from "@/application/use-cases/upgradetopremium/CapturePaymentUseCase";
import { EditChannelUseCase } from "@/application/use-cases/channel/EditChannelUseCase";
import { ListChannelsForUserUseCase } from "@/application/use-cases/channel/ListChannelsForUserUseCase";
import { DeleteChannelUseCase } from "@/application/use-cases/channel/DeleteChannelUseCase";
import { SendMessageUseCase } from "@/application/use-cases/message/SendMessageUseCase";
import { ListMessagesUseCase } from "@/application/use-cases/message/ListMessagesUseCase";
import { MessageRepository } from "@/infra/db/mongoose/repositories/MessageRepository";
import { MessageController } from "@/interface-adapters/controllers/message/MessageController";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

const authSvc = new JwtAuthService();
const emailSvc = new NodemailerEmailService();
const razorpaySvc = new RazorpayService();

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

// Repositories
const projectRepo = new ProjectRepository();
const membershipRepo = new ProjectMembershipRepository();
const channelRepo = new ChannelRepository();
const userSubRepo = new UserSubscriptionRepository();
const messageRepo = new MessageRepository();
// Use Cases
const createProjectUC = new CreateProjectUseCase(
  projectRepo,
  userSubRepo,
  planRepo,
  membershipRepo
);
const getUserProjectsUC = new GetUserProjectsUseCase(projectRepo);
const addMemberUC = new AddMemberToProjectUseCase(
  membershipRepo,
  projectRepo,
  userSubRepo,
  planRepo
);
const removeMemberUC = new RemoveMemberFromProjectUseCase(membershipRepo);
const changeRoleUC = new ChangeMemberRoleUseCase(membershipRepo);

const getLimitsUC = new GetUserLimitsUseCase(
  projectRepo,
  membershipRepo,
  userSubRepo,
  planRepo
);
const getAvailablePlansUC = new GetAvailablePlansUseCase(planRepo);
const upgradeSubUC = new UpgradeToPlanUseCase(
  userSubRepo,
  planRepo,
  razorpaySvc
);
const capturePaymentUC = new CapturePaymentUseCase(userSubRepo);

//Messages
export const sendMessageUC = new SendMessageUseCase(
  messageRepo,
  membershipRepo,
  userRepo
);
export const listMessagesUC = new ListMessagesUseCase(messageRepo);
//Channels
const createChannelUC = new CreateChannelUseCase(channelRepo, membershipRepo);
const editChannelUC = new EditChannelUseCase(channelRepo, membershipRepo);
const listChannelUC = new ListChannelsForUserUseCase(
  channelRepo,
  membershipRepo
);
const deleteChannelUC = new DeleteChannelUseCase(channelRepo, membershipRepo);

// Controllers
export const projectController = new ProjectController(
  createProjectUC,
  getUserProjectsUC
);
export const memberController = new MemberController(
  addMemberUC,
  removeMemberUC,
  changeRoleUC,
  userService
);
export const channelController = new ChannelController(
  createChannelUC,
  editChannelUC,
  deleteChannelUC,
  listChannelUC
);
export const subscriptionController = new SubscriptionController(
  upgradeSubUC,
  getLimitsUC,
  getAvailablePlansUC,
  capturePaymentUC
);
export const messageController = new MessageController(
  sendMessageUC,
  listMessagesUC
);
