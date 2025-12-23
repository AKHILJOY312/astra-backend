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
import {
  GoogleLogin,
  GoogleProfile,
} from "../../../application/use-cases/auth/GoogleLogin";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import {
  AUTH_MESSAGES,
  ERROR_MESSAGES,
} from "@/interface-adapters/http/constants/messages";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import {
  BadRequestError,
  UnauthorizedError,
} from "@/application/error/AppError";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "@/infra/web/express/utils/cookieUtils";
import { ENV } from "@/config/env.config";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.RegisterUser) private registerUC: RegisterUser,
    @inject(TYPES.VerifyEmail) private verifyEmailUC: VerifyEmail,
    @inject(TYPES.LoginUser) private loginUC: LoginUser,
    @inject(TYPES.RefreshToken) private refreshUC: RefreshToken,
    @inject(TYPES.LogoutUser) private logoutUC: LogoutUser,
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
      const googleProfile = req.user as GoogleProfile | undefined;
      if (!googleProfile) throw new Error(ERROR_MESSAGES.GOOGLE_ERROR);

      const { accessToken, refreshToken } = await this.googleLoginUC.execute(
        googleProfile
      );

      setRefreshTokenCookie(res, refreshToken);

      const redirectUrl = `${ENV.CLIENT_URL}/success?token=${accessToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      // Type narrowed: error is unknown here (best practice)
      const message =
        error instanceof BadRequestError
          ? error.message
          : "Authentication failed";

      const errorRedirect = `${
        ENV.CLIENT_URL
      }/auth/login?error=${encodeURIComponent(message)}`;
      res.redirect(errorRedirect);
    }
  };

  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.registerUC.execute(req.body);
    res.status(HTTP_STATUS.CREATED).json(result);
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;
    if (typeof token !== "string")
      throw new BadRequestError(ERROR_MESSAGES.INVALID_TOKEN);
    const msg = await this.verifyEmailUC.execute(token);
    res.json(msg);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await this.loginUC.execute(
      email,
      password
    );

    setRefreshTokenCookie(res, refreshToken);

    res.json({ message: AUTH_MESSAGES.LOGIN_SUCCESS, accessToken, user });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new UnauthorizedError(AUTH_MESSAGES.NO_REFRESH_TOKEN);
    }
    // return res
    //   .status(HTTP_STATUS.UNAUTHORIZED)
    //   .json({ message: AUTH_MESSAGES.NO_REFRESH_TOKEN });

    const { accessToken } = await this.refreshUC.execute(token);
    res.json({ accessToken });
  });

  // logout = (_: Request, res: Response) => {
  //   clearRefreshTokenCookie(res);
  //   res.json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
  // };
  logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken as string | undefined;
    // const accessToken = req.headers.authorization?.split(" ")[1]; // Optional: if client sends it

    if (!refreshToken) {
      return res.json({ message: ERROR_MESSAGES.NO_SESSION });
    }

    // 1. Blacklist refresh token (using existing use case)
    const refreshExpiresAt: Date = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ); // fallback
    // const refreshPayload = jwt.decode(refreshToken) as { exp?: number } | null;
    // if (refreshPayload?.exp) {
    //   refreshExpiresAt = new Date(refreshPayload.exp * 1000);
    // }

    await this.logoutUC.execute(refreshToken, refreshExpiresAt);
    clearRefreshTokenCookie(res);
    res.json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS });
  };

  me = asyncHandler(async (req: Request, res: Response) => {
    // @ts-expect-error – set by protect middleware
    const userId: string = req.user.id;
    const data = await this.meUC.execute(userId);
    res.json(data);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError(AUTH_MESSAGES.EMAIL_REQUIRED);
    }
    // return res
    //   .status(HTTP_STATUS.BAD_REQUEST)
    //   .json({ message: AUTH_MESSAGES.EMAIL_REQUIRED });

    const msg = await this.forgotUC.execute(email);
    res.json(msg);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    const { password, confirmPassword } = req.body;
    const msg = await this.resetUC.execute(token, password, confirmPassword);
    res.json(msg);
  });

  verifyResetToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    const { valid } = await this.verifyResetUC.execute(token);
    res.json({ message: AUTH_MESSAGES.RESET_TOKEN_VALID, valid });
  });
}
