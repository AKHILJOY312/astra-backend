// src/config/routes.ts

export const API_ROUTES = {
  BASE: "/",
  AUTH: {
    ROOT: "/auth",
    SESSION: "/session",

    //old routes
    REGISTER: "/register",
    LOGIN: "/login",
    // LOGOUT: "/logout",
    REFRESH: "/refresh-token",
    ME: "/me",
    VERIFY_EMAIL: "/verify-email",
    VERIFY_RESET_TOKEN: "/verify-reset-token",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

    GOOGLE: {
      ROOT: "/google",
      PASSPORT: "/google/passport",
      CALLBACK: "/google/callback",
    },
  },

  ADMIN: {
    ROOT: "/",
    MAIN: "/admin",
    BY_ID: "/:id",
    AUTH: "/admin/auth",
    USERS: "/admin/users",
    PLANS: "/admin/plans",
    STATUS: "/:id/status",
    ROLE: "/:id/role",
    BILLING: "/billings",
    DETAILS: "/billings/details",
    DASHBOARD: "/dashboard",
    ANALYTICS: "/dashboard/analytics",
  },

  USER: {
    ROOT: "/user",
    ME: "/me",
    PROFILE_IMAGE_URL: "/profile-image",
    CHANGE_PASSWORD: "/change-password",
    REQUEST_EMAIL_OTP: "/change-email/request",
    VERIFY_EMAIL_OTP: "/change-email/verify",
  },

  PROJECTS: {
    BASE: "/",
    ROOT: "/projects",
    BY_ID: "/:projectId",
    MEMBERS: "/:projectId/members",
    BY_MEMBER_ID: "/:projectId/members/:memberId",
    MEMBER_ROLE: "/:projectId/members/:memberId/role",
    CHANNELS: "/projects/:projectId/channels",
    INVITATION_ACCEPT: "/invitations/accept",
    TASKS: {
      ROOT: "/:projectId/tasks",
      BY_ID: "/tasks/:taskId",
      STATUS: "/tasks/:taskId/status",
      COMMENT: "/:projectId/tasks/:taskId/comment",
      ATTACHMENT_UPLOAD: "/:projectId/tasks/attachments/upload-url",
      MEMBERS_SEARCH: "/:projectId/tasks/members/search",
      GET_ALL_TASKS: "/tasks",
    },
  },

  CHANNELS: {
    ROOT: "/",
    BY_ID: "/:channelId",
    MESSAGES: "/:channelId/messages",
    ATTACHMENT_UPLOAD_URL: "/:channelId/upload-url",
  },
  ATTACHMENT: {
    ROOT: "/attachments",
    ATTACHMENT_ACCESS_URL: "/:attachmentId",
  },

  SUBSCRIPTION: {
    ROOT: "/subscription",
    PLANS: "/plans",
    LIMITS: "/limits",
    RAZORPAY: {
      ORDER: "/razorpay/order",
      CAPTURE: "/razorpay/capture",
    },
    PAYMENT_HISTORY: "/history",
    INVOICES: "/invoice/:paymentId",
  },
  MEETING: {
    ROOT: "/meetings",
    CODE: "/:code",
    LEAVE: "/leave",
    TOKEN: "/:code/token",
  },
} as const;
