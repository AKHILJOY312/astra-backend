// src/interfaces/controllers/AdminAuthController.ts
import { Request, Response } from "express";
import { AdminLogin } from "../../../application/use-cases/auth/admin/AdminLogin";
import { AdminForgotPassword } from "../../../application/use-cases/auth/admin/AdminForgotPassword";
import { AdminResetPassword } from "../../../application/use-cases/auth/admin/AdminResetPassword";
import { HTTP_STATUS } from "../../http/constants/httpStatus";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/types";

@injectable()
export class AdminAuthController {
  constructor(
    @inject(TYPES.AdminLogin) private adminLogin: AdminLogin,
    @inject(TYPES.AdminForgotPassword)
    private adminForgotPassword: AdminForgotPassword,
    @inject(TYPES.AdminResetPassword)
    private adminResetPassword: AdminResetPassword
  ) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.adminLogin.execute(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: err.message });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await this.adminForgotPassword.execute(email);
      res.json(result);
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password, confirmPassword } = req.body;
      await this.adminResetPassword.execute(token, password, confirmPassword);
      res.json({ message: "Password reset successful" });
    } catch (err: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ message: err.message });
    }
  };
}
