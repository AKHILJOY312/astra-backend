// src/container.ts

import { Container } from "inversify";
import { TYPES } from "./types";

// Repositories
import { UserRepository } from "../infra/db/mongoose/repositories/UserRepository";
import { PlanRepository } from "../infra/db/mongoose/repositories/PlanRepository";
import { ProjectRepository } from "../infra/db/mongoose/repositories/ProjectRepository";
import { ProjectMembershipRepository } from "../infra/db/mongoose/repositories/ProjectMembershipRepository";
import { ChannelRepository } from "../infra/db/mongoose/repositories/ChannelRepository";
import { UserSubscriptionRepository } from "../infra/db/mongoose/repositories/UserSubscriptionRepository";
import { MessageRepository } from "@/infra/db/mongoose/repositories/MessageRepository";

// Services
import { JwtAuthService } from "../infra/auth/JwtAuthService";
import { NodemailerEmailService } from "../infra/email/NodemailerEmailService";
import { UserService } from "../application/services/UserService";
import { RazorpayService } from "@/infra/payment/RazorpayService";

// Use Cases (Auth/User)
import { RegisterUser } from "../application/use-cases/auth/RegisterUser";
import { VerifyEmail } from "../application/use-cases/auth/VerifyEmail";
import { LoginUser } from "../application/use-cases/auth/LoginUser";
import { RefreshToken } from "../application/use-cases/auth/RefreshToken";
import { LogoutUser } from "../application/use-cases/auth/LogoutUser";
import { GetMe } from "../application/use-cases/auth/GetMe";
import { ForgotPassword } from "../application/use-cases/auth/ForgotPassword";
import { ResetPassword } from "../application/use-cases/auth/ResetPassword";
import { VerifyResetToken } from "../application/use-cases/auth/VerifyResetToken";
import { GoogleLogin } from "../application/use-cases/auth/GoogleLogin";

// Use Cases (Admin Auth)
import { AdminLogin } from "../application/use-cases/auth/admin/AdminLogin";
import { AdminForgotPassword } from "../application/use-cases/auth/admin/AdminForgotPassword";
import { AdminResetPassword } from "../application/use-cases/auth/admin/AdminResetPassword";

// Use Cases (Admin User)
import { ListUsersUseCase } from "@/application/use-cases/user/ListUserUseCase";
import { BlockUserUseCase } from "@/application/use-cases/user/BlockUserUseCase";
import { AssignAdminRoleUseCase } from "@/application/use-cases/user/AssingAdminRoleUseCase";

// Use Cases (Plan)
import { CreatePlan } from "../application/use-cases/plan/admin/CreatePlan";
import { UpdatePlan } from "../application/use-cases/plan/admin/UpdatePlan";
import { SoftDeletePlan } from "../application/use-cases/plan/admin/SoftDeletePlan";
import { GetPlansPaginated } from "../application/use-cases/plan/admin/GetPlansPaginated";
import { GetAvailablePlansUseCase } from "../application/use-cases/plan/user/GetAvailablePlansUseCase";

// Use Cases (Project/Membership)
import { CreateProjectUseCase } from "../application/use-cases/project/CreateProjectUseCase";
import { GetUserProjectsUseCase } from "../application/use-cases/project/GetUserProjectsUseCase";
import { AddMemberToProjectUseCase } from "../application/use-cases/project/AddMemberToProjectUseCase";
import { RemoveMemberFromProjectUseCase } from "../application/use-cases/project/RemoveMemberFromProjectUseCase";
import { ChangeMemberRoleUseCase } from "../application/use-cases/project/ChangeMemberRoleUseCase";

// Use Cases (Channel)
import { CreateChannelUseCase } from "../application/use-cases/channel/CreateChannelUseCase";
import { EditChannelUseCase } from "@/application/use-cases/channel/EditChannelUseCase";
import { ListChannelsForUserUseCase } from "@/application/use-cases/channel/ListChannelsForUserUseCase";
import { DeleteChannelUseCase } from "@/application/use-cases/channel/DeleteChannelUseCase";

// Use Cases (Subscription/Payment)
import { GetUserLimitsUseCase } from "../application/use-cases/upgradetopremium/GetUserLimitsUseCase";
import { UpgradeToPlanUseCase } from "../application/use-cases/upgradetopremium/UpgradeToPlanUseCase";
import { CapturePaymentUseCase } from "@/application/use-cases/upgradetopremium/CapturePaymentUseCase";

// Use Cases (Message)
import { SendMessageUseCase } from "@/application/use-cases/message/SendMessageUseCase";
import { ListMessagesUseCase } from "@/application/use-cases/message/ListMessagesUseCase";

// Controllers
import { AuthController } from "../interface-adapters/controllers/auth/AuthController";
import { AdminAuthController } from "../interface-adapters/controllers/auth/AdminAuthController";
import { AdminUserController } from "@/interface-adapters/controllers/user/AdminUserController";
import { PlanController } from "../interface-adapters/controllers/plan/PlanController";
import { ProjectController } from "../interface-adapters/controllers/project/ProjectController";
import { MemberController } from "../interface-adapters/controllers/project/MemberController";
import { ChannelController } from "../interface-adapters/controllers/channel/ChannelController";
import { SubscriptionController } from "../interface-adapters/controllers/plan/SubscriptionController";
import { MessageController } from "@/interface-adapters/controllers/message/MessageController";

// Middleware
import { createProtectMiddleware } from "../infra/middleware/protect";
import { ListProjectMembersUseCase } from "@/application/use-cases/project/ListProjectMembersUseCase";
import { UpdateProjectUseCase } from "@/application/use-cases/project/UpdateProjectUseCase";
import { UserController } from "@/interface-adapters/controllers/user/UserController";
import { GetUserProfileUseCase } from "@/application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserProfileUseCase";
import { DeleteUserAccountUseCase } from "@/application/use-cases/user/DeleteUserAccountUseCase";

const container = new Container();

// --- Repositories (Bind as a Singleton since they are state-less data access layers)
container
  .bind<UserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();
container
  .bind<PlanRepository>(TYPES.PlanRepository)
  .to(PlanRepository)
  .inSingletonScope();
container
  .bind<ProjectRepository>(TYPES.ProjectRepository)
  .to(ProjectRepository)
  .inSingletonScope();
container
  .bind<ProjectMembershipRepository>(TYPES.ProjectMembershipRepository)
  .to(ProjectMembershipRepository)
  .inSingletonScope();
container
  .bind<ChannelRepository>(TYPES.ChannelRepository)
  .to(ChannelRepository)
  .inSingletonScope();
container
  .bind<UserSubscriptionRepository>(TYPES.UserSubscriptionRepository)
  .to(UserSubscriptionRepository)
  .inSingletonScope();
container
  .bind<MessageRepository>(TYPES.MessageRepository)
  .to(MessageRepository)
  .inSingletonScope();

// --- Services (Bind as a Singleton)
container
  .bind<UserService>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope();
container
  .bind<JwtAuthService>(TYPES.AuthService)
  .to(JwtAuthService)
  .inSingletonScope();
container
  .bind<NodemailerEmailService>(TYPES.EmailService)
  .to(NodemailerEmailService)
  .inSingletonScope();
container
  .bind<RazorpayService>(TYPES.PaymentService)
  .to(RazorpayService)
  .inSingletonScope();

// --- Middleware
// Protect middleware is a factory function, so we bind the result of the function
// to the SYMBOL, ensuring it has access to the UserRepository via Inversify resolution.
container
  .bind(TYPES.ProtectMiddleware)
  .toDynamicValue(() => {
    const userRepo = container.get<UserRepository>(TYPES.UserRepository);
    return createProtectMiddleware(userRepo);
  })
  .inSingletonScope();

// --- Use Cases (Bind as Transient by default, or Singleton if state-less and expensive to create)

// Auth/User Use Cases
container.bind<RegisterUser>(TYPES.RegisterUser).to(RegisterUser);
container.bind<VerifyEmail>(TYPES.VerifyEmail).to(VerifyEmail);
container.bind<LoginUser>(TYPES.LoginUser).to(LoginUser);
container.bind<RefreshToken>(TYPES.RefreshToken).to(RefreshToken);
container.bind<LogoutUser>(TYPES.LogoutUser).to(LogoutUser);
container.bind<GetMe>(TYPES.GetMe).to(GetMe);
container.bind<ForgotPassword>(TYPES.ForgotPassword).to(ForgotPassword);
container.bind<ResetPassword>(TYPES.ResetPassword).to(ResetPassword);
container.bind<VerifyResetToken>(TYPES.VerifyResetToken).to(VerifyResetToken);
container.bind<GoogleLogin>(TYPES.GoogleLogin).to(GoogleLogin);

// Admin Auth Use Cases
container.bind<AdminLogin>(TYPES.AdminLogin).to(AdminLogin);
container
  .bind<AdminForgotPassword>(TYPES.AdminForgotPassword)
  .to(AdminForgotPassword);
container
  .bind<AdminResetPassword>(TYPES.AdminResetPassword)
  .to(AdminResetPassword);

// Admin User Use Cases
container.bind<ListUsersUseCase>(TYPES.ListUsersUseCase).to(ListUsersUseCase);
container.bind<BlockUserUseCase>(TYPES.BlockUserUseCase).to(BlockUserUseCase);
container
  .bind<AssignAdminRoleUseCase>(TYPES.AssignAdminRoleUseCase)
  .to(AssignAdminRoleUseCase);

//User Use Case
container
  .bind<GetUserProfileUseCase>(TYPES.GetUserProfileUseCase)
  .to(GetUserProfileUseCase);
container
  .bind<UpdateUserProfileUseCase>(TYPES.UpdateUserProfileUseCase)
  .to(UpdateUserProfileUseCase);
container
  .bind<DeleteUserAccountUseCase>(TYPES.DeleteUserAccountUseCase)
  .to(DeleteUserAccountUseCase);

// Plan Use Cases
container.bind<CreatePlan>(TYPES.CreatePlan).to(CreatePlan);
container.bind<UpdatePlan>(TYPES.UpdatePlan).to(UpdatePlan);
container.bind<SoftDeletePlan>(TYPES.SoftDeletePlan).to(SoftDeletePlan);
container
  .bind<GetPlansPaginated>(TYPES.GetPlansPaginated)
  .to(GetPlansPaginated);
container
  .bind<GetAvailablePlansUseCase>(TYPES.GetAvailablePlansUseCase)
  .to(GetAvailablePlansUseCase);

// Project/Membership Use Cases
container
  .bind<CreateProjectUseCase>(TYPES.CreateProjectUseCase)
  .to(CreateProjectUseCase);
container
  .bind<UpdateProjectUseCase>(TYPES.UpdateProjectUseCase)
  .to(UpdateProjectUseCase);
container
  .bind<GetUserProjectsUseCase>(TYPES.GetUserProjectsUseCase)
  .to(GetUserProjectsUseCase);
container
  .bind<AddMemberToProjectUseCase>(TYPES.AddMemberToProjectUseCase)
  .to(AddMemberToProjectUseCase);
container
  .bind<RemoveMemberFromProjectUseCase>(TYPES.RemoveMemberFromProjectUseCase)
  .to(RemoveMemberFromProjectUseCase);
container
  .bind<ChangeMemberRoleUseCase>(TYPES.ChangeMemberRoleUseCase)
  .to(ChangeMemberRoleUseCase);
container
  .bind<ListProjectMembersUseCase>(TYPES.ListProjectMembers)
  .to(ListProjectMembersUseCase);

// Channel Use Cases
container
  .bind<CreateChannelUseCase>(TYPES.CreateChannelUseCase)
  .to(CreateChannelUseCase);
container
  .bind<EditChannelUseCase>(TYPES.EditChannelUseCase)
  .to(EditChannelUseCase);
container
  .bind<ListChannelsForUserUseCase>(TYPES.ListChannelsForUserUseCase)
  .to(ListChannelsForUserUseCase);
container
  .bind<DeleteChannelUseCase>(TYPES.DeleteChannelUseCase)
  .to(DeleteChannelUseCase);

// Subscription/Payment Use Cases
container
  .bind<GetUserLimitsUseCase>(TYPES.GetUserLimitsUseCase)
  .to(GetUserLimitsUseCase);
container
  .bind<UpgradeToPlanUseCase>(TYPES.UpgradeToPlanUseCase)
  .to(UpgradeToPlanUseCase);
container
  .bind<CapturePaymentUseCase>(TYPES.CapturePaymentUseCase)
  .to(CapturePaymentUseCase);

// Message Use Cases
container
  .bind<SendMessageUseCase>(TYPES.SendMessageUseCase)
  .to(SendMessageUseCase);
container
  .bind<ListMessagesUseCase>(TYPES.ListMessagesUseCase)
  .to(ListMessagesUseCase);

// --- Controllers (Bind as Transient, since they usually serve a single request)
container.bind<AuthController>(TYPES.AuthController).to(AuthController);
container
  .bind<AdminAuthController>(TYPES.AdminAuthController)
  .to(AdminAuthController);
container
  .bind<AdminUserController>(TYPES.AdminUserController)
  .to(AdminUserController);
container.bind<PlanController>(TYPES.PlanController).to(PlanController);
container
  .bind<ProjectController>(TYPES.ProjectController)
  .to(ProjectController);
container.bind<MemberController>(TYPES.MemberController).to(MemberController);
container
  .bind<ChannelController>(TYPES.ChannelController)
  .to(ChannelController);
container
  .bind<SubscriptionController>(TYPES.SubscriptionController)
  .to(SubscriptionController);
container
  .bind<MessageController>(TYPES.MessageController)
  .to(MessageController);
container.bind<UserController>(TYPES.UserController).to(UserController);

export { container };

// To resolve your protect middleware in your routes:
// export const protect = container.get(TYPES.ProtectMiddleware) as ReturnType<typeof createProtectMiddleware>;
