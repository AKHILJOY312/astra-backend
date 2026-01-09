// src/config/routes.ts

export const API_ROUTES = {
  AUTH: {
    ROOT: "/auth",
    REGISTER: "/register",
    LOGIN: "/login",
    LOGOUT: "/logout",
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
    BY_ID: "/:id",
    AUTH: "/admin/auth",
    USERS: "/admin/users",
    PLANS: "/admin/plans",
    STATUS: "/:id/status",
    ROLE: "/:id/role",
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
  },

  CHANNELS: {
    ROOT: "/",
    BY_ID: "/:channelId",
    MESSAGES: "/:channelId/messages",
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
  },
} as const;
