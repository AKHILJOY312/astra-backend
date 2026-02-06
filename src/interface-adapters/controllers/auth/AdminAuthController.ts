// src/interfaces/controllers/AdminAuthController.ts
import { Request, Response } from "express";

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { AUTH_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { IAdminLogin } from "@/application/ports/use-cases/auth/admin/IAdminLoginUseCase";
import { IAdminForgotPassword } from "@/application/ports/use-cases/auth/admin/IAdminForgotPasswordUseCase";
import { IAdminResetPassword } from "@/application/ports/use-cases/auth/admin/IAdminResetPasswordUseCase";
import { setRefreshTokenCookie } from "@/infra/web/express/utils/cookieUtils";

@injectable()
export class AdminAuthController {
  constructor(
    @inject(TYPES.AdminLoginUseCase) private _adminLogin: IAdminLogin,
    @inject(TYPES.AdminForgotPasswordUseCase)
    private _adminForgotPassword: IAdminForgotPassword,
    @inject(TYPES.AdminResetPasswordUseCase)
    private _adminResetPassword: IAdminResetPassword,
  ) {}

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this._adminLogin.execute(email, password);
    setRefreshTokenCookie(res, result.refreshToken);
    res.json(result);
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this._adminForgotPassword.execute(email);
    res.json(result);
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, password, confirmPassword } = req.body;
    await this._adminResetPassword.execute(token, password, confirmPassword);
    res.json({ message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS });
  };
}
