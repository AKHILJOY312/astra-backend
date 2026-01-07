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
import { InviteMemberToProjectUseCase } from "../application/use-cases/project/InviteMemberToProjectUseCase";
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
import { createProtectMiddleware } from "../infra/web/express/middleware/protect";
import { ListProjectMembersUseCase } from "@/application/use-cases/project/ListProjectMembersUseCase";
import { UpdateProjectUseCase } from "@/application/use-cases/project/UpdateProjectUseCase";
import { UserController } from "@/interface-adapters/controllers/user/UserController";
import { GetUserProfileUseCase } from "@/application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserNameUseCase";
import { DeleteUserAccountUseCase } from "@/application/use-cases/user/DeleteUserAccountUseCase";
import { MongoTokenBlacklistService } from "@/infra/services/MongoTokenBlacklistService";
//IUseCase
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
import { IRegisterUser } from "@/application/ports/use-cases/auth/IRegisterUserUseCase";
import { IVerifyEmail } from "@/application/ports/use-cases/auth/IVerifyEmailUseCase";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";
import { ILogoutUser } from "@/application/ports/use-cases/auth/ILogoutUserUseCase";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";
import { IForgotPassword } from "@/application/ports/use-cases/auth/IForgotPasswordUseCase";
import { IResetPassword } from "@/application/ports/use-cases/auth/IResetPasswordUseCase";
import { IVerifyResetToken } from "@/application/ports/use-cases/auth/IVerifyResetTokenUseCase";
import { IGoogleLogin } from "@/application/ports/use-cases/auth/IGoogleLoginUseCase";
import { IAdminLogin } from "@/application/ports/use-cases/auth/admin/IAdminLoginUseCase";
import { IAdminForgotPassword } from "@/application/ports/use-cases/auth/admin/IAdminForgotPasswordUseCase";
import { IAdminResetPassword } from "@/application/ports/use-cases/auth/admin/IAdminResetPasswordUseCase";
import { IListUsersUseCase } from "@/application/ports/use-cases/user/IListUsersUseCase";
import { IBlockUserUseCase } from "@/application/ports/use-cases/user/IBlockUserUseCase";
import { IAssignAdminRoleUseCase } from "@/application/ports/use-cases/user/IAssignAdminRoleUseCase";
import { IGetUserProfileUseCase } from "@/application/ports/use-cases/user/IGetUserProfileUseCase";
import { IUpdateUserProfileUseCase } from "@/application/ports/use-cases/user/IUpdateUserProfileUseCase";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";
import { ICreatePlan } from "@/application/ports/use-cases/plan/admin/ICreatePlanUseCase";
import { IUpdatePlan } from "@/application/ports/use-cases/plan/admin/IUpdatePlanUseCase";
import { ISoftDeletePlan } from "@/application/ports/use-cases/plan/admin/ISoftDeletePlanUseCase";
import { IGetPlansPaginated } from "@/application/ports/use-cases/plan/admin/IGetPlansPaginatedUseCase";
import { IGetAvailablePlansUseCase } from "@/application/ports/use-cases/plan/user/IGetAvailablePlansUseCase";
import { ICreateProjectUseCase } from "@/application/ports/use-cases/project/ICreateProjectUseCase";
import { IUpdateProjectUseCase } from "@/application/ports/use-cases/project/IUpdateProjectUseCase";
import { IGetUserProjectsUseCase } from "@/application/ports/use-cases/project/IGetUserProjectsUseCase";
import { IInviteMemberToProjectUseCase } from "@/application/ports/use-cases/project/IInviteMemberToProjectUseCase";
import { IRemoveMemberFromProjectUseCase } from "@/application/ports/use-cases/project/IRemoveMemberFromProjectUseCase";
import { IChangeMemberRoleUseCase } from "@/application/ports/use-cases/project/IChangeMemberRoleUseCase";
import { IListProjectMembersUseCase } from "@/application/ports/use-cases/project/IListProjectMembersUseCase";
import { ICreateChannelUseCase } from "@/application/ports/use-cases/channel/ICreateChannelUseCase";
import { IEditChannelUseCase } from "@/application/ports/use-cases/channel/IEditChannelUseCase";
import { IListChannelsForUserUseCase } from "@/application/ports/use-cases/channel/IListChannelsForUserUseCase";
import { IDeleteChannelUseCase } from "@/application/ports/use-cases/channel/IDeleteChannelUseCase";
import { IGetUserLimitsUseCase } from "@/application/ports/use-cases/upgradetopremium/IGetUserLimitsUseCase";
import { IUpgradeToPlanUseCase } from "@/application/ports/use-cases/upgradetopremium/IUpgradeToPlanUseCase";
import { ICapturePaymentUseCase } from "@/application/ports/use-cases/upgradetopremium/ICapturePaymentUseCase";
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { IListMessagesUseCase } from "@/application/ports/use-cases/message/IListMessagesUseCase";
import { IUserService } from "@/application/ports/services/IUserService";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IRazorpayService } from "@/application/ports/services/IRazorpayService";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { IUploadProfileImageUseCase } from "@/application/ports/use-cases/user/IUploadProfileImageUseCase";
import { UploadProfileImageUseCase } from "@/application/use-cases/user/UploadProfileImageUseCase";
import { IFileUploadService } from "@/application/ports/services/IFileUploadService";
import { S3FileUploadService } from "@/infra/services/S3FileUploadService";
import { IChangePasswordUseCase } from "@/application/ports/use-cases/user/IChangePasswordUseCase";
import { ChangePasswordUseCase } from "@/application/use-cases/user/ChangePasswordUseCase";
import { IRequestEmailChangeUseCase } from "@/application/ports/use-cases/user/IRequestEmailChangeUseCase";
import { RequestEmailChangeUseCase } from "@/application/use-cases/user/RequestEmailChangeUseCase";
import { IVerifyEmailChangeUseCase } from "@/application/ports/use-cases/user/IVerifyEmailChangeUseCase";
import { VerifyEmailChangeUseCase } from "@/application/use-cases/user/VerifyEmailChangeUseCase";
import { IEmailChangeOtpRepository } from "@/application/ports/repositories/IEmailChangeOtpRepository";
import { EmailChangeOtpRepository } from "@/infra/db/mongoose/repositories/EmailChangeOtpRepository";
import { IMessageRepository } from "@/application/ports/repositories/IMessageRepository";
import { IUserSubscriptionRepository } from "@/application/ports/repositories/IUserSubscriptionRepository";
import { IChannelRepository } from "@/application/ports/repositories/IChannelRepository";
import { IProjectMembershipRepository } from "@/application/ports/repositories/IProjectMembershipRepository";
import { IProjectRepository } from "@/application/ports/repositories/IProjectRepository";
import { IPlanRepository } from "@/application/ports/repositories/IPlanRepository";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IInvitationRepository } from "@/application/ports/repositories/IInvitationRepository";
import { InvitationRepository } from "@/infra/db/mongoose/repositories/InvitationRepository";
import { IAcceptInvitationUseCase } from "@/application/ports/use-cases/project/IAcceptInvitationUseCase";
import { AcceptInvitationUseCase } from "@/application/use-cases/project/AcceptInvitationUseCase";
import { IPaymentRepository } from "@/application/ports/repositories/IPaymentRepository";
import { PaymentRepository } from "@/infra/db/mongoose/repositories/PaymentRepository";

const container = new Container();

//-------------------------------------------------------
// --- Repositories (Bind as a Singleton since they are state-less data access layers)
//-------------------------------------------------------

container
  .bind<IUserRepository>(TYPES.UserRepository)
  .to(UserRepository)
  .inSingletonScope();
container
  .bind<IPlanRepository>(TYPES.PlanRepository)
  .to(PlanRepository)
  .inSingletonScope();
container
  .bind<IProjectRepository>(TYPES.ProjectRepository)
  .to(ProjectRepository)
  .inSingletonScope();
container
  .bind<IProjectMembershipRepository>(TYPES.ProjectMembershipRepository)
  .to(ProjectMembershipRepository)
  .inSingletonScope();
container
  .bind<IChannelRepository>(TYPES.ChannelRepository)
  .to(ChannelRepository)
  .inSingletonScope();
container
  .bind<IUserSubscriptionRepository>(TYPES.UserSubscriptionRepository)
  .to(UserSubscriptionRepository)
  .inSingletonScope();
container
  .bind<IMessageRepository>(TYPES.MessageRepository)
  .to(MessageRepository)
  .inSingletonScope();
container
  .bind<IEmailChangeOtpRepository>(TYPES.EmailChangeOtpRepository)
  .to(EmailChangeOtpRepository)
  .inSingletonScope();
container
  .bind<IInvitationRepository>(TYPES.InvitationRepository)
  .to(InvitationRepository)
  .inSingletonScope();
container
  .bind<IPaymentRepository>(TYPES.PaymentRepository)
  .to(PaymentRepository)
  .inSingletonScope();
//-------------------------------------------------------
// --- Services (Bind as a Singleton)
//-------------------------------------------------------

container
  .bind<IUserService>(TYPES.UserService)
  .to(UserService)
  .inSingletonScope();
container
  .bind<IAuthService>(TYPES.AuthService)
  .to(JwtAuthService)
  .inSingletonScope();
container
  .bind<IEmailService>(TYPES.EmailService)
  .to(NodemailerEmailService)
  .inSingletonScope();
container
  .bind<IRazorpayService>(TYPES.PaymentService)
  .to(RazorpayService)
  .inSingletonScope();
container
  .bind<ITokenBlacklistService>(TYPES.TokenBlacklistService)
  .to(MongoTokenBlacklistService)
  .inSingletonScope();
container
  .bind<IFileUploadService>(TYPES.FileUploadService)
  .to(S3FileUploadService);
//-------------------------------------------------------
// --- Middleware
// Protect middleware is a factory function, so we bind the result of the function
// to the SYMBOL, ensuring it has access to the UserRepository via Inversify resolution.
//-------------------------------------------------------

container
  .bind(TYPES.ProtectMiddleware)
  .toDynamicValue(() => {
    const userRepo = container.get<UserRepository>(TYPES.UserRepository);
    const blacklistService = container.get<MongoTokenBlacklistService>(
      TYPES.TokenBlacklistService
    );
    return createProtectMiddleware(userRepo, blacklistService);
  })
  .inSingletonScope();

//-------------------------------------------------------
// --- Use Cases
//-------------------------------------------------------

// Auth/User Use Cases
container.bind<IRegisterUser>(TYPES.RegisterUser).to(RegisterUser);
container.bind<IVerifyEmail>(TYPES.VerifyEmail).to(VerifyEmail);
container.bind<ILoginUser>(TYPES.LoginUser).to(LoginUser);
container.bind<IRefreshToken>(TYPES.RefreshToken).to(RefreshToken);
container.bind<ILogoutUser>(TYPES.LogoutUser).to(LogoutUser);
container.bind<IGetMe>(TYPES.GetMe).to(GetMe);
container.bind<IForgotPassword>(TYPES.ForgotPassword).to(ForgotPassword);
container.bind<IResetPassword>(TYPES.ResetPassword).to(ResetPassword);
container.bind<IVerifyResetToken>(TYPES.VerifyResetToken).to(VerifyResetToken);
container.bind<IGoogleLogin>(TYPES.GoogleLogin).to(GoogleLogin);

// Admin Auth Use Cases
container.bind<IAdminLogin>(TYPES.AdminLogin).to(AdminLogin);
container
  .bind<IAdminForgotPassword>(TYPES.AdminForgotPassword)
  .to(AdminForgotPassword);
container
  .bind<IAdminResetPassword>(TYPES.AdminResetPassword)
  .to(AdminResetPassword);

// Admin User Use Cases
container.bind<IListUsersUseCase>(TYPES.ListUsersUseCase).to(ListUsersUseCase);
container.bind<IBlockUserUseCase>(TYPES.BlockUserUseCase).to(BlockUserUseCase);
container
  .bind<IAssignAdminRoleUseCase>(TYPES.AssignAdminRoleUseCase)
  .to(AssignAdminRoleUseCase);

//User Use Case
container
  .bind<IGetUserProfileUseCase>(TYPES.GetUserProfileUseCase)
  .to(GetUserProfileUseCase);
container
  .bind<IUpdateUserProfileUseCase>(TYPES.UpdateUserNameUseCase)
  .to(UpdateUserProfileUseCase);
container
  .bind<IDeleteUserAccountUseCase>(TYPES.DeleteUserAccountUseCase)
  .to(DeleteUserAccountUseCase);
container
  .bind<IChangePasswordUseCase>(TYPES.ChangePasswordUseCase)
  .to(ChangePasswordUseCase);
container
  .bind<IRequestEmailChangeUseCase>(TYPES.RequestEmailChangeUseCase)
  .to(RequestEmailChangeUseCase);
container
  .bind<IVerifyEmailChangeUseCase>(TYPES.VerifyEmailChangeUseCase)
  .to(VerifyEmailChangeUseCase);

// Plan Use Cases
container.bind<ICreatePlan>(TYPES.CreatePlan).to(CreatePlan);
container.bind<IUpdatePlan>(TYPES.UpdatePlan).to(UpdatePlan);
container.bind<ISoftDeletePlan>(TYPES.SoftDeletePlan).to(SoftDeletePlan);
container
  .bind<IGetPlansPaginated>(TYPES.GetPlansPaginated)
  .to(GetPlansPaginated);
container
  .bind<IGetAvailablePlansUseCase>(TYPES.GetAvailablePlansUseCase)
  .to(GetAvailablePlansUseCase);
container
  .bind<IUploadProfileImageUseCase>(TYPES.UploadProfileImageUseCase)
  .to(UploadProfileImageUseCase);

// Project/Membership Use Cases
container
  .bind<ICreateProjectUseCase>(TYPES.CreateProjectUseCase)
  .to(CreateProjectUseCase);
container
  .bind<IUpdateProjectUseCase>(TYPES.UpdateProjectUseCase)
  .to(UpdateProjectUseCase);
container
  .bind<IGetUserProjectsUseCase>(TYPES.GetUserProjectsUseCase)
  .to(GetUserProjectsUseCase);
container
  .bind<IInviteMemberToProjectUseCase>(TYPES.InviteMemberToProjectUseCase)
  .to(InviteMemberToProjectUseCase);
container
  .bind<IAcceptInvitationUseCase>(TYPES.AcceptInvitationUseCase)
  .to(AcceptInvitationUseCase);
container
  .bind<IRemoveMemberFromProjectUseCase>(TYPES.RemoveMemberFromProjectUseCase)
  .to(RemoveMemberFromProjectUseCase);
container
  .bind<IChangeMemberRoleUseCase>(TYPES.ChangeMemberRoleUseCase)
  .to(ChangeMemberRoleUseCase);
container
  .bind<IListProjectMembersUseCase>(TYPES.ListProjectMembers)
  .to(ListProjectMembersUseCase);

// Channel Use Cases
container
  .bind<ICreateChannelUseCase>(TYPES.CreateChannelUseCase)
  .to(CreateChannelUseCase);
container
  .bind<IEditChannelUseCase>(TYPES.EditChannelUseCase)
  .to(EditChannelUseCase);
container
  .bind<IListChannelsForUserUseCase>(TYPES.ListChannelsForUserUseCase)
  .to(ListChannelsForUserUseCase);
container
  .bind<IDeleteChannelUseCase>(TYPES.DeleteChannelUseCase)
  .to(DeleteChannelUseCase);

// Subscription/Payment Use Cases
container
  .bind<IGetUserLimitsUseCase>(TYPES.GetUserLimitsUseCase)
  .to(GetUserLimitsUseCase);
container
  .bind<IUpgradeToPlanUseCase>(TYPES.UpgradeToPlanUseCase)
  .to(UpgradeToPlanUseCase);
container
  .bind<ICapturePaymentUseCase>(TYPES.CapturePaymentUseCase)
  .to(CapturePaymentUseCase);

// Message Use Cases
container
  .bind<ISendMessageUseCase>(TYPES.SendMessageUseCase)
  .to(SendMessageUseCase);
container
  .bind<IListMessagesUseCase>(TYPES.ListMessagesUseCase)
  .to(ListMessagesUseCase);

//-------------------------------------------------------
// --- Controllers
//-------------------------------------------------------

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
