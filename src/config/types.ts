const TYPES = {
  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  PlanRepository: Symbol.for("PlanRepository"),
  ProjectRepository: Symbol.for("ProjectRepository"),
  MembershipRepository: Symbol.for("MembershipRepository"),
  ChannelRepository: Symbol.for("ChannelRepository"),
  UserSubscriptionRepository: Symbol.for("UserSubscriptionRepository"),
  MessageRepository: Symbol.for("MessageRepository"),

  // Services
  AuthService: Symbol.for("AuthService"),
  EmailService: Symbol.for("EmailService"),
  RazorpayService: Symbol.for("RazorpayService"),
  UserService: Symbol.for("UserService"),

  // Auth Use Cases
  RegisterUser: Symbol.for("RegisterUser"),
  VerifyEmail: Symbol.for("VerifyEmail"),
  LoginUser: Symbol.for("LoginUser"),
  RefreshToken: Symbol.for("RefreshToken"),
  LogoutUser: Symbol.for("LogoutUser"),
  GetMe: Symbol.for("GetMe"),
  ForgotPassword: Symbol.for("ForgotPassword"),
  ResetPassword: Symbol.for("ResetPassword"),
  VerifyReset: Symbol.for("VerifyReset"),
  GoogleLogin: Symbol.for("GoogleLogin"),

  // Admin Auth
  AdminLogin: Symbol.for("AdminLogin"),
  AdminForgot: Symbol.for("AdminForgot"),
  AdminReset: Symbol.for("AdminReset"),

  // Plan Usecases
  CreatePlan: Symbol.for("CreatePlan"),
  UpdatePlan: Symbol.for("UpdatePlan"),
  DeletePlan: Symbol.for("DeletePlan"),
  GetPlansPaginated: Symbol.for("GetPlansPaginated"),

  // Project + Membership
  CreateProject: Symbol.for("CreateProject"),
  GetUserProjects: Symbol.for("GetUserProjects"),
  AddMember: Symbol.for("AddMember"),
  RemoveMember: Symbol.for("RemoveMember"),
  ChangeRole: Symbol.for("ChangeRole"),

  // Premium / Subscription
  GetUserLimits: Symbol.for("GetUserLimits"),
  GetAvailablePlans: Symbol.for("GetAvailablePlans"),
  UpgradeToPlan: Symbol.for("UpgradeToPlan"),
  CapturePayment: Symbol.for("CapturePayment"),

  // Channels
  CreateChannel: Symbol.for("CreateChannel"),
  EditChannel: Symbol.for("EditChannel"),
  ListChannels: Symbol.for("ListChannels"),
  DeleteChannel: Symbol.for("DeleteChannel"),

  // Messages
  SendMessage: Symbol.for("SendMessage"),
  ListMessages: Symbol.for("ListMessages"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  AdminAuthController: Symbol.for("AdminAuthController"),
  PlanController: Symbol.for("PlanController"),
  ProjectController: Symbol.for("ProjectController"),
  MemberController: Symbol.for("MemberController"),
  ChannelController: Symbol.for("ChannelController"),
  SubscriptionController: Symbol.for("SubscriptionController"),
  MessageController: Symbol.for("MessageController"),
};

export default TYPES;
