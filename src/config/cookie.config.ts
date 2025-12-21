import { ENV } from "./env.config";

// src/config/cookie.config.ts
export const REFRESH_TOKEN_COOKIE_CONFIG = {
  name: "refreshToken",
  options: {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: Number(ENV.JWT.REFRESH_MS),
    path: "/",
  },
} as const;
