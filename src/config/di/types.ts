const TYPES = {
  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  PlanRepository: Symbol.for("PlanRepository"),
  ProjectRepository: Symbol.for("ProjectRepository"),
  ProjectMembershipRepository: Symbol.for("ProjectMembershipRepository"),
  ChannelRepository: Symbol.for("ChannelRepository"),
  UserSubscriptionRepository: Symbol.for("UserSubscriptionRepository"),
  MessageRepository: Symbol.for("MessageRepository"),
  EmailChangeOtpRepository: Symbol.for("EmailChangeOtpRepository"),
  InvitationRepository: Symbol.for("InvitationRepository"),
  PaymentRepository: Symbol.for("PaymentRepository"),
  CounterRepository: Symbol.for("CounterRepository"),
  AttachmentRepository: Symbol.for("AttachmentRepository"),
  TaskRepository: Symbol.for("TaskRepository"),
  MemberRepository: Symbol.for("MemberRepository"),
  TaskAttachmentRepository: Symbol.for("TaskAttachmentRepository"),
  MeetingRepository: Symbol.for("MeetingRepository"),
  CommentRepository: Symbol.for("CommentRepository"),

  // Services
  UserService: Symbol.for("UserService"),
  AuthService: Symbol.for("AuthService"), // For JwtAuthService
  EmailService: Symbol.for("EmailService"), // For NodemailerEmailService
  PaymentService: Symbol.for("PaymentService"), // For RazorpayService
  TokenBlacklistService: Symbol.for("TokenBlacklistService"),
  FileUploadService: Symbol.for("FileUploadService"),
  PdfInvoiceService: Symbol.for("PdfInvoiceService"),

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
  TaskController: Symbol.for("TaskController"),
  MemberSearchController: Symbol.for("MemberSearchController"),
  MeetingController: Symbol.for("MeetingController"),

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
  UpdateUserNameUseCase: Symbol.for("UpdateUserNameUseCase"),
  DeleteUserAccountUseCase: Symbol.for("DeleteUserAccountUseCase"),
  UploadProfileImageUseCase: Symbol.for("UploadProfileImageUseCase"),
  ChangePasswordUseCase: Symbol.for("ChangePasswordUseCase"),
  RequestEmailChangeUseCase: Symbol.for("RequestEmailChangeUseCase"),
  VerifyEmailChangeUseCase: Symbol.for("VerifyEmailChangeUseCase"),

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
  InviteMemberToProjectUseCase: Symbol.for("InviteMemberToProjectUseCase"),
  AcceptInvitationUseCase: Symbol.for("AcceptInvitationUseCase"),
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
  GetUserBillingUseCase: Symbol.for("GetUserBillingUseCase"),
  DownloadInvoiceOutput: Symbol.for("DownloadInvoiceOutput"),

  // Use Cases (Message)
  SendMessageUseCase: Symbol.for("SendMessageUseCase"),
  ListMessagesUseCase: Symbol.for("ListMessagesUseCase"),
  GenerateUploadUrlUseCase: Symbol.for("GenerateUploadUrlUseCase"),
  GetAttachmentDownloadUrlUseCase: Symbol.for(
    "GetAttachmentDownloadUrlUseCase",
  ),

  //Tasks
  CreateTaskUseCase: Symbol.for("CreateTaskUseCase"),
  DeleteTaskUseCase: Symbol.for("DeleteTaskUseCase"),
  GetProjectTasksUseCase: Symbol.for("GetProjectTasksUseCase"),
  UpdateTaskStatusUseCase: Symbol.for("UpdateTaskStatusUseCase"),
  GetAttachmentUploadUrlUseCase: Symbol.for("GetAttachmentUploadUrlUseCase"),
  GetTaskAttachmentDownloadUrlUseCase: Symbol.for(
    "GetTaskAttachmentDownloadUrlUseCase",
  ),
  UpdateTaskUseCase: Symbol.for("UpdateTaskUseCase"),
  AddCommentUseCase: Symbol.for("AddCommentUseCase"),

  //Search the user with the project
  SearchProjectMembersUseCase: Symbol.for("SearchProjectMembersUseCase"),

  //Meetings
  CreateMeetingUseCase: Symbol.for("CreateMeetingUseCase"),
  JoinMeetingUseCase: Symbol.for("JoinMeetingUseCase"),
  LeaveMeetingUseCase: Symbol.for("LeaveMeetingUseCase"),
};

export { TYPES };
