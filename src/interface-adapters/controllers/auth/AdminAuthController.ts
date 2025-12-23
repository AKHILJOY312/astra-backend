// src/interfaces/controllers/AdminAuthController.ts
import { Request, Response } from "express";
import { AdminLogin } from "../../../application/use-cases/auth/admin/AdminLogin";
import { AdminForgotPassword } from "../../../application/use-cases/auth/admin/AdminForgotPassword";
import { AdminResetPassword } from "../../../application/use-cases/auth/admin/AdminResetPassword";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";
import { asyncHandler } from "@/infra/web/express/handler/asyncHandler";
import { AUTH_MESSAGES } from "@/interface-adapters/http/constants/messages";

@injectable()
export class AdminAuthController {
  constructor(
    @inject(TYPES.AdminLogin) private adminLogin: AdminLogin,
    @inject(TYPES.AdminForgotPassword)
    private adminForgotPassword: AdminForgotPassword,
    @inject(TYPES.AdminResetPassword)
    private adminResetPassword: AdminResetPassword
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
