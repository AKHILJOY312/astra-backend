// src/interfaces/controllers/AuthController.ts
import { Request, Response } from "express";
import { RegisterUser } from "../../../application/use-cases/auth/RegisterUser";
import { VerifyEmail } from "../../../application/use-cases/auth/VerifyEmail";
import { LoginUser } from "../../../application/use-cases/auth/LoginUser";
import { RefreshToken } from "../../../application/use-cases/auth/RefreshToken";
import { LogoutUser } from "../../../application/use-cases/auth/LogoutUser";
import { GetMe } from "../../../application/use-cases/auth/GetMe";
import { ForgotPassword } from "../../../application/use-cases/auth/ForgotPassword";
import { ResetPassword } from "../../../application/use-cases/auth/ResetPassword";
import { VerifyResetToken } from "../../../application/use-cases/auth/VerifyResetToken";
import { GoogleLogin } from "../../../application/use-cases/auth/GoogleLogin";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { AUTH_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

// Dependency container (simple DI – you can replace with Inversify, tsyringe, etc.)
@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUser) private registerUC: RegisterUser,
    @inject(TYPES.VerifyEmail) private verifyEmailUC: VerifyEmail,
    @inject(TYPES.LoginUser) private loginUC: LoginUser,
    @inject(TYPES.RefreshToken) private refreshUC: RefreshToken,
    @inject(TYPES.LoginUser) private logoutUC: LogoutUser,
    @inject(TYPES.GetMe) private meUC: GetMe,
    @inject(TYPES.ForgotPassword) private forgotUC: ForgotPassword,
    @inject(TYPES.ResetPassword) private resetUC: ResetPassword,
    @inject(TYPES.VerifyResetToken) private verifyResetUC: VerifyResetToken,
    @inject(TYPES.GoogleLogin) private googleLoginUC: GoogleLogin
  ) {}

  googleLogin = (_req: Request, res: Response) => {
    res.redirect("/api/auth/google/passport");
  };

  googleCallback = async (req: Request, res: Response) => {
    try {
      const googleProfile = req.user as any;
      if (!googleProfile) throw new Error("Google login failed");

      const { accessToken, refreshToken } = await this.googleLoginUC.execute(
        googleProfile
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const redirectUrl = `${process.env.CLIENT_URL}/success?token=${accessToken}`;
      res.redirect(redirectUrl);
    } catch (e: any) {
      res.redirect(
        `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(
          e.message
        )}`
      );
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.registerUC.execute(req.body);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (e: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: e.message });
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (typeof token !== "string") throw new Error("Invalid token");
      const msg = await this.verifyEmailUC.execute(token);
      res.json(msg);
    } catch (e: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: e.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await this.loginUC.execute(
        email,
        password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ message: AUTH_MESSAGES.LOGIN_SUCCESS, accessToken, user });
    } catch (e: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: e.message });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token)
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: AUTH_MESSAGES.NO_REFRESH_TOKEN });

    try {
      const { accessToken } = await this.refreshUC.execute(token);
      res.json({ accessToken });
    } catch (e: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: e.message });
    }
  };

  logout = (_: Request, res: Response) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
  };

  me = async (req: Request, res: Response) => {
    // @ts-expect-error – set by protect middleware
    const userId: string = req.user.id;

    try {
      const data = await this.meUC.execute(userId);

      res.json(data);
    } catch (e: any) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: e.message });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email)
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: AUTH_MESSAGES.EMAIL_REQUIRED });

    try {
      const msg = await this.forgotUC.execute(email);
      res.json(msg);
    } catch (e: any) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: e.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    const { password, confirmPassword } = req.body;

    try {
      const msg = await this.resetUC.execute(token, password, confirmPassword);
      res.json(msg);
    } catch (e: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: e.message });
    }
  };

  verifyResetToken = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };

    try {
      const { valid } = await this.verifyResetUC.execute(token);
      res.json({ message: AUTH_MESSAGES.RESET_TOKEN_VALID, valid });
    } catch (e: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: e.message });
    }
  };
}
