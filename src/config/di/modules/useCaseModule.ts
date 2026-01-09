import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Use Cases (Auth)
import { RegisterUser } from "@/application/use-cases/auth/RegisterUser";
import { VerifyEmail } from "@/application/use-cases/auth/VerifyEmail";
import { LoginUser } from "@/application/use-cases/auth/LoginUser";
import { RefreshToken } from "@/application/use-cases/auth/RefreshToken";
import { LogoutUser } from "@/application/use-cases/auth/LogoutUser";
import { GetMe } from "@/application/use-cases/auth/GetMe";
import { ForgotPassword } from "@/application/use-cases/auth/ForgotPassword";
import { ResetPassword } from "@/application/use-cases/auth/ResetPassword";
import { VerifyResetToken } from "@/application/use-cases/auth/VerifyResetToken";
import { GoogleLogin } from "@/application/use-cases/auth/GoogleLogin";

// Use Cases (Admin Auth)
import { AdminLogin } from "@/application/use-cases/auth/admin/AdminLogin";
import { AdminForgotPassword } from "@/application/use-cases/auth/admin/AdminForgotPassword";
import { AdminResetPassword } from "@/application/use-cases/auth/admin/AdminResetPassword";

// Ports (Interfaces)
import { IRegisterUser } from "@/application/ports/use-cases/auth/IRegisterUserUseCase";
import { IVerifyEmail } from "@/application/ports/use-cases/auth/IVerifyEmailUseCase";
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
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
// Use Cases (Admin User)
import { IListUsersUseCase } from "@/application/ports/use-cases/user/IListUsersUseCase";
import { IBlockUserUseCase } from "@/application/ports/use-cases/user/IBlockUserUseCase";
import { IAssignAdminRoleUseCase } from "@/application/ports/use-cases/user/IAssignAdminRoleUseCase";
import { ListUsersUseCase } from "@/application/use-cases/user/ListUserUseCase";
import { BlockUserUseCase } from "@/application/use-cases/user/BlockUserUseCase";
import { AssignAdminRoleUseCase } from "@/application/use-cases/user/AssingAdminRoleUseCase";
// Use Cases (Plan)
import { ICreatePlan } from "@/application/ports/use-cases/plan/admin/ICreatePlanUseCase";
import { IUpdatePlan } from "@/application/ports/use-cases/plan/admin/IUpdatePlanUseCase";
import { ISoftDeletePlan } from "@/application/ports/use-cases/plan/admin/ISoftDeletePlanUseCase";
import { IGetPlansPaginated } from "@/application/ports/use-cases/plan/admin/IGetPlansPaginatedUseCase";
import { IGetAvailablePlansUseCase } from "@/application/ports/use-cases/plan/user/IGetAvailablePlansUseCase";
import { CreatePlan } from "@/application/use-cases/plan/admin/CreatePlan";
import { UpdatePlan } from "@/application/use-cases/plan/admin/UpdatePlan";
import { SoftDeletePlan } from "@/application/use-cases/plan/admin/SoftDeletePlan";
import { GetPlansPaginated } from "@/application/use-cases/plan/admin/GetPlansPaginated";
import { GetAvailablePlansUseCase } from "@/application/use-cases/plan/user/GetAvailablePlansUseCase";
// Use Cases (Project/Membership)
import { ICreateProjectUseCase } from "@/application/ports/use-cases/project/ICreateProjectUseCase";
import { IUpdateProjectUseCase } from "@/application/ports/use-cases/project/IUpdateProjectUseCase";
import { IGetUserProjectsUseCase } from "@/application/ports/use-cases/project/IGetUserProjectsUseCase";
import { IInviteMemberToProjectUseCase } from "@/application/ports/use-cases/project/IInviteMemberToProjectUseCase";
import { IRemoveMemberFromProjectUseCase } from "@/application/ports/use-cases/project/IRemoveMemberFromProjectUseCase";
import { IChangeMemberRoleUseCase } from "@/application/ports/use-cases/project/IChangeMemberRoleUseCase";
import { IListProjectMembersUseCase } from "@/application/ports/use-cases/project/IListProjectMembersUseCase";
import { CreateProjectUseCase } from "@/application/use-cases/project/CreateProjectUseCase";
import { GetUserProjectsUseCase } from "@/application/use-cases/project/GetUserProjectsUseCase";
import { InviteMemberToProjectUseCase } from "@/application/use-cases/project/InviteMemberToProjectUseCase";
import { RemoveMemberFromProjectUseCase } from "@/application/use-cases/project/RemoveMemberFromProjectUseCase";
import { ChangeMemberRoleUseCase } from "@/application/use-cases/project/ChangeMemberRoleUseCase";
import { ListProjectMembersUseCase } from "@/application/use-cases/project/ListProjectMembersUseCase";
import { UpdateProjectUseCase } from "@/application/use-cases/project/UpdateProjectUseCase";
import { IAcceptInvitationUseCase } from "@/application/ports/use-cases/project/IAcceptInvitationUseCase";
import { AcceptInvitationUseCase } from "@/application/use-cases/project/AcceptInvitationUseCase";
// Use Cases (Channel)
import { CreateChannelUseCase } from "@/application/use-cases/channel/CreateChannelUseCase";
import { EditChannelUseCase } from "@/application/use-cases/channel/EditChannelUseCase";
import { ListChannelsForUserUseCase } from "@/application/use-cases/channel/ListChannelsForUserUseCase";
import { DeleteChannelUseCase } from "@/application/use-cases/channel/DeleteChannelUseCase";
import { ICreateChannelUseCase } from "@/application/ports/use-cases/channel/ICreateChannelUseCase";
import { IEditChannelUseCase } from "@/application/ports/use-cases/channel/IEditChannelUseCase";
import { IListChannelsForUserUseCase } from "@/application/ports/use-cases/channel/IListChannelsForUserUseCase";
import { IDeleteChannelUseCase } from "@/application/ports/use-cases/channel/IDeleteChannelUseCase";
// Use Cases (Subscription/Payment)
import { IGetUserLimitsUseCase } from "@/application/ports/use-cases/upgradetopremium/IGetUserLimitsUseCase";
import { IUpgradeToPlanUseCase } from "@/application/ports/use-cases/upgradetopremium/IUpgradeToPlanUseCase";
import { ICapturePaymentUseCase } from "@/application/ports/use-cases/upgradetopremium/ICapturePaymentUseCase";
import { GetUserLimitsUseCase } from "@/application/use-cases/upgradetopremium/GetUserLimitsUseCase";
import { UpgradeToPlanUseCase } from "@/application/use-cases/upgradetopremium/UpgradeToPlanUseCase";
import { CapturePaymentUseCase } from "@/application/use-cases/upgradetopremium/CapturePaymentUseCase";
// Use Cases (Message)
import { ISendMessageUseCase } from "@/application/ports/use-cases/message/ISendMessageUseCase";
import { IListMessagesUseCase } from "@/application/ports/use-cases/message/IListMessagesUseCase";
import { SendMessageUseCase } from "@/application/use-cases/message/SendMessageUseCase";
import { ListMessagesUseCase } from "@/application/use-cases/message/ListMessagesUseCase";

//User
import { GetUserProfileUseCase } from "@/application/use-cases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/application/use-cases/user/UpdateUserNameUseCase";
import { DeleteUserAccountUseCase } from "@/application/use-cases/user/DeleteUserAccountUseCase";
import { IChangePasswordUseCase } from "@/application/ports/use-cases/user/IChangePasswordUseCase";
import { ChangePasswordUseCase } from "@/application/use-cases/user/ChangePasswordUseCase";
import { IRequestEmailChangeUseCase } from "@/application/ports/use-cases/user/IRequestEmailChangeUseCase";
import { RequestEmailChangeUseCase } from "@/application/use-cases/user/RequestEmailChangeUseCase";
import { IVerifyEmailChangeUseCase } from "@/application/ports/use-cases/user/IVerifyEmailChangeUseCase";
import { VerifyEmailChangeUseCase } from "@/application/use-cases/user/VerifyEmailChangeUseCase";
import { IGetUserProfileUseCase } from "@/application/ports/use-cases/user/IGetUserProfileUseCase";
import { IUpdateUserProfileUseCase } from "@/application/ports/use-cases/user/IUpdateUserProfileUseCase";
import { IDeleteUserAccountUseCase } from "@/application/ports/use-cases/user/IDeleteUserAccountUseCase";
import { IUploadProfileImageUseCase } from "@/application/ports/use-cases/user/IUploadProfileImageUseCase";
import { UploadProfileImageUseCase } from "@/application/use-cases/user/UploadProfileImageUseCase";
import { IGetUserBillingHistoryUseCase } from "@/application/ports/use-cases/upgradetopremium/IGetUserBillingHistoryUseCase ";
import { GetUserBillingUseCase } from "@/application/use-cases/upgradetopremium/GetUserBillingHistoryUseCase";

export const useCaseModule = new ContainerModule((options) => {
  // Regular Auth Use Cases
  options.bind<IRegisterUser>(TYPES.RegisterUser).to(RegisterUser);
  options.bind<IVerifyEmail>(TYPES.VerifyEmail).to(VerifyEmail);
  options.bind<ILoginUser>(TYPES.LoginUser).to(LoginUser);
  options.bind<IRefreshToken>(TYPES.RefreshToken).to(RefreshToken);
  options.bind<ILogoutUser>(TYPES.LogoutUser).to(LogoutUser);
  options.bind<IGetMe>(TYPES.GetMe).to(GetMe);
  options.bind<IForgotPassword>(TYPES.ForgotPassword).to(ForgotPassword);
  options.bind<IResetPassword>(TYPES.ResetPassword).to(ResetPassword);
  options.bind<IVerifyResetToken>(TYPES.VerifyResetToken).to(VerifyResetToken);
  options.bind<IGoogleLogin>(TYPES.GoogleLogin).to(GoogleLogin);

  // Admin Auth Use Cases
  options.bind<IAdminLogin>(TYPES.AdminLogin).to(AdminLogin);
  options
    .bind<IAdminForgotPassword>(TYPES.AdminForgotPassword)
    .to(AdminForgotPassword);
  options
    .bind<IAdminResetPassword>(TYPES.AdminResetPassword)
    .to(AdminResetPassword);

  // Admin User Use Cases
  options.bind<IListUsersUseCase>(TYPES.ListUsersUseCase).to(ListUsersUseCase);
  options.bind<IBlockUserUseCase>(TYPES.BlockUserUseCase).to(BlockUserUseCase);
  options
    .bind<IAssignAdminRoleUseCase>(TYPES.AssignAdminRoleUseCase)
    .to(AssignAdminRoleUseCase);

  //User Use Case
  options
    .bind<IGetUserProfileUseCase>(TYPES.GetUserProfileUseCase)
    .to(GetUserProfileUseCase);
  options
    .bind<IUpdateUserProfileUseCase>(TYPES.UpdateUserNameUseCase)
    .to(UpdateUserProfileUseCase);
  options
    .bind<IDeleteUserAccountUseCase>(TYPES.DeleteUserAccountUseCase)
    .to(DeleteUserAccountUseCase);
  options
    .bind<IChangePasswordUseCase>(TYPES.ChangePasswordUseCase)
    .to(ChangePasswordUseCase);
  options
    .bind<IRequestEmailChangeUseCase>(TYPES.RequestEmailChangeUseCase)
    .to(RequestEmailChangeUseCase);
  options
    .bind<IVerifyEmailChangeUseCase>(TYPES.VerifyEmailChangeUseCase)
    .to(VerifyEmailChangeUseCase);
  options
    .bind<IUploadProfileImageUseCase>(TYPES.UploadProfileImageUseCase)
    .to(UploadProfileImageUseCase);

  // Plan Use Cases
  options.bind<ICreatePlan>(TYPES.CreatePlan).to(CreatePlan);
  options.bind<IUpdatePlan>(TYPES.UpdatePlan).to(UpdatePlan);
  options.bind<ISoftDeletePlan>(TYPES.SoftDeletePlan).to(SoftDeletePlan);
  options
    .bind<IGetPlansPaginated>(TYPES.GetPlansPaginated)
    .to(GetPlansPaginated);
  options
    .bind<IGetAvailablePlansUseCase>(TYPES.GetAvailablePlansUseCase)
    .to(GetAvailablePlansUseCase);

  // Project/Membership Use Cases
  options
    .bind<ICreateProjectUseCase>(TYPES.CreateProjectUseCase)
    .to(CreateProjectUseCase);
  options
    .bind<IUpdateProjectUseCase>(TYPES.UpdateProjectUseCase)
    .to(UpdateProjectUseCase);
  options
    .bind<IGetUserProjectsUseCase>(TYPES.GetUserProjectsUseCase)
    .to(GetUserProjectsUseCase);
  options
    .bind<IInviteMemberToProjectUseCase>(TYPES.InviteMemberToProjectUseCase)
    .to(InviteMemberToProjectUseCase);
  options
    .bind<IAcceptInvitationUseCase>(TYPES.AcceptInvitationUseCase)
    .to(AcceptInvitationUseCase);
  options
    .bind<IRemoveMemberFromProjectUseCase>(TYPES.RemoveMemberFromProjectUseCase)
    .to(RemoveMemberFromProjectUseCase);
  options
    .bind<IChangeMemberRoleUseCase>(TYPES.ChangeMemberRoleUseCase)
    .to(ChangeMemberRoleUseCase);
  options
    .bind<IListProjectMembersUseCase>(TYPES.ListProjectMembers)
    .to(ListProjectMembersUseCase);

  // Channel Use Cases
  options
    .bind<ICreateChannelUseCase>(TYPES.CreateChannelUseCase)
    .to(CreateChannelUseCase);
  options
    .bind<IEditChannelUseCase>(TYPES.EditChannelUseCase)
    .to(EditChannelUseCase);
  options
    .bind<IListChannelsForUserUseCase>(TYPES.ListChannelsForUserUseCase)
    .to(ListChannelsForUserUseCase);
  options
    .bind<IDeleteChannelUseCase>(TYPES.DeleteChannelUseCase)
    .to(DeleteChannelUseCase);

  // Subscription/Payment Use Cases
  options
    .bind<IGetUserLimitsUseCase>(TYPES.GetUserLimitsUseCase)
    .to(GetUserLimitsUseCase);
  options
    .bind<IUpgradeToPlanUseCase>(TYPES.UpgradeToPlanUseCase)
    .to(UpgradeToPlanUseCase);
  options
    .bind<ICapturePaymentUseCase>(TYPES.CapturePaymentUseCase)
    .to(CapturePaymentUseCase);
  options
    .bind<IGetUserBillingHistoryUseCase>(TYPES.GetUserBillingUseCase)
    .to(GetUserBillingUseCase);
  // Message Use Cases
  options
    .bind<ISendMessageUseCase>(TYPES.SendMessageUseCase)
    .to(SendMessageUseCase);
  options
    .bind<IListMessagesUseCase>(TYPES.ListMessagesUseCase)
    .to(ListMessagesUseCase);
});
