// src/interfaces/controllers/AdminAuthController.ts
import { Request, Response } from "express";

import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { AUTH_MESSAGES } from "@/interface-adapters/http/constants/messages";
import { IAdminLogin } from "@/application/ports/use-cases/auth/admin/IAdminLoginUseCase";
import { IAdminForgotPassword } from "@/application/ports/use-cases/auth/admin/IAdminForgotPasswordUseCase";
import { IAdminResetPassword } from "@/application/ports/use-cases/auth/admin/IAdminResetPasswordUseCase";

@injectable()
export class AdminAuthController {
  constructor(
    @inject(TYPES.AdminLogin) private adminLogin: IAdminLogin,
    @inject(TYPES.AdminForgotPassword)
    private adminForgotPassword: IAdminForgotPassword,
    @inject(TYPES.AdminResetPassword)
    private adminResetPassword: IAdminResetPassword
  ) {}

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.adminLogin.execute(email, password);
    res.json(result);
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await this.adminForgotPassword.execute(email);
    res.json(result);
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password, confirmPassword } = req.body;
    await this.adminResetPassword.execute(token, password, confirmPassword);
    res.json({ message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS });
  });
}
