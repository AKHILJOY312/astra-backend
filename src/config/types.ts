// src/common/types.ts (Create this file)

const TYPES = {
  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  PlanRepository: Symbol.for("PlanRepository"),
  ProjectRepository: Symbol.for("ProjectRepository"),
  ProjectMembershipRepository: Symbol.for("ProjectMembershipRepository"),
  ChannelRepository: Symbol.for("ChannelRepository"),
  UserSubscriptionRepository: Symbol.for("UserSubscriptionRepository"),
  MessageRepository: Symbol.for("MessageRepository"),

  // Services
  UserService: Symbol.for("UserService"),
  AuthService: Symbol.for("AuthService"), // For JwtAuthService
  EmailService: Symbol.for("EmailService"), // For NodemailerEmailService
  PaymentService: Symbol.for("PaymentService"), // For RazorpayService
  TokenBlacklistService: Symbol.for("TokenBlacklistService"),
  // Middleware
  ProtectMiddleware: Symbol.for("ProtectMiddleware"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  AdminAuthController: Symbol.for("AdminAuthController"),
  AdminUserController: Symbol.for("AdminUserController"),
  PlanController: Symbol.for("PlanController"),
  ProjectController: Symbol.for("ProjectController"),
  MemberController: Symbol.for("MemberController"),
  ChannelController: Symbol.for("ChannelController"),
  SubscriptionController: Symbol.for("SubscriptionController"),
  MessageController: Symbol.for("MessageController"),
  UserController: Symbol.for("UserController"),

  // Use Cases (User/Auth)
  RegisterUser: Symbol.for("RegisterUser"),
  VerifyEmail: Symbol.for("VerifyEmail"),
  LoginUser: Symbol.for("LoginUser"),
  RefreshToken: Symbol.for("RefreshToken"),
  LogoutUser: Symbol.for("LogoutUser"),
  GetMe: Symbol.for("GetMe"),
  ForgotPassword: Symbol.for("ForgotPassword"),
  ResetPassword: Symbol.for("ResetPassword"),
  VerifyResetToken: Symbol.for("VerifyResetToken"),
  GoogleLogin: Symbol.for("GoogleLogin"),

  // Use Cases (Admin Auth)
  AdminLogin: Symbol.for("AdminLogin"),
  AdminForgotPassword: Symbol.for("AdminForgotPassword"),
  AdminResetPassword: Symbol.for("AdminResetPassword"),

  // Use Cases (Admin User)
  ListUsersUseCase: Symbol.for("ListUsersUseCase"),
  BlockUserUseCase: Symbol.for("BlockUserUseCase"),
  AssignAdminRoleUseCase: Symbol.for("AssignAdminRoleUseCase"),

  // Use Cases ( User)
  GetUserProfileUseCase: Symbol.for("GetUserProfileUseCase"),
  UpdateUserProfileUseCase: Symbol.for("UpdateUserProfileUseCase"),
  DeleteUserAccountUseCase: Symbol.for("DeleteUserAccountUseCase"),

  // Use Cases (Plan Admin)
  CreatePlan: Symbol.for("CreatePlan"),
  UpdatePlan: Symbol.for("UpdatePlan"),
  SoftDeletePlan: Symbol.for("SoftDeletePlan"),
  GetPlansPaginated: Symbol.for("GetPlansPaginated"),
  GetAvailablePlansUseCase: Symbol.for("GetAvailablePlansUseCase"),

  // Use Cases (Project/Membership)
  CreateProjectUseCase: Symbol.for("CreateProjectUseCase"),
  UpdateProjectUseCase: Symbol.for("UpdateProjectUseCase"),
  GetUserProjectsUseCase: Symbol.for("GetUserProjectsUseCase"),
  AddMemberToProjectUseCase: Symbol.for("AddMemberToProjectUseCase"),
  RemoveMemberFromProjectUseCase: Symbol.for("RemoveMemberFromProjectUseCase"),
  ChangeMemberRoleUseCase: Symbol.for("ChangeMemberRoleUseCase"),
  ListProjectMembers: Symbol.for("ListProjectMembers"),

  // Use Cases (Channel)
  CreateChannelUseCase: Symbol.for("CreateChannelUseCase"),
  EditChannelUseCase: Symbol.for("EditChannelUseCase"),
  ListChannelsForUserUseCase: Symbol.for("ListChannelsForUserUseCase"),
  DeleteChannelUseCase: Symbol.for("DeleteChannelUseCase"),

  // Use Cases (Subscription/Payment)
  GetUserLimitsUseCase: Symbol.for("GetUserLimitsUseCase"),
  UpgradeToPlanUseCase: Symbol.for("UpgradeToPlanUseCase"),
  CapturePaymentUseCase: Symbol.for("CapturePaymentUseCase"),

  // Use Cases (Message)
  SendMessageUseCase: Symbol.for("SendMessageUseCase"),
  ListMessagesUseCase: Symbol.for("ListMessagesUseCase"),
};

export { TYPES };
