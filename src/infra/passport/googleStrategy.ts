// src/infrastructure/passport/googleStrategy.ts
import { ENV } from "@/config/env.config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const setupGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: ENV.GOOGLE.ID!,
        clientSecret: ENV.GOOGLE.SECRET!,
        callbackURL: "/api/auth/google/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        // JUST PASS THE PROFILE — NO DB LOGIC
        return done(null, profile);
      }
    )
  );
};
