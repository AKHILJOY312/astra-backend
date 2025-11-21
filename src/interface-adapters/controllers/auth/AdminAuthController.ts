// src/interfaces/controllers/AdminAuthController.ts
import { Request, Response } from "express";
import { AdminLogin } from "../../../application/use-cases/auth/admin/AdminLogin";
import { AdminForgotPassword } from "../../../application/use-cases/auth/admin/AdminForgotPassword";
import { AdminResetPassword } from "../../../application/use-cases/auth/admin/AdminResetPassword";

export class AdminAuthController {
  constructor(
    private adminLogin: AdminLogin,
    private adminForgotPassword: AdminForgotPassword,
    private adminResetPassword: AdminResetPassword
  ) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.adminLogin.execute(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await this.adminForgotPassword.execute(email);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password, confirmPassword } = req.body;
      await this.adminResetPassword.execute(token, password, confirmPassword);
      res.json({ message: "Password reset successful" });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
}
