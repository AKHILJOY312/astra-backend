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

// Dependency container (simple DI – you can replace with Inversify, tsyringe, etc.)
export class AuthController {
  constructor(
    private registerUC: RegisterUser,
    private verifyEmailUC: VerifyEmail,
    private loginUC: LoginUser,
    private refreshUC: RefreshToken,
    private logoutUC: LogoutUser,
    private meUC: GetMe,
    private forgotUC: ForgotPassword,
    private resetUC: ResetPassword,
    private verifyResetUC: VerifyResetToken
  ) {}

  register = async (req: Request, res: Response) => {
    try {
      const result = await this.registerUC.execute(req.body);
      res.status(201).json(result);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const { token } = req.query;

      if (typeof token !== "string") throw new Error("Invalid token");
      const msg = await this.verifyEmailUC.execute(token);
      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
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

      res.json({ message: "Login successful", accessToken, user });
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    try {
      const { accessToken } = await this.refreshUC.execute(token);
      res.json({ accessToken });
    } catch (e: any) {
      res.status(401).json({ message: e.message });
    }
  };

  logout = (_: Request, res: Response) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({ message: "Logged out" });
  };

  me = async (req: Request, res: Response) => {
    // @ts-ignore – set by protect middleware
    const userId: string = req.user.id;

    try {
      const data = await this.meUC.execute(userId);
      res.json(data);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
      const msg = await this.forgotUC.execute(email);
      res.json(msg);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    console.log(token);
    const { password, confirmPassword } = req.body;
    console.log(password);
    try {
      const msg = await this.resetUC.execute(token, password, confirmPassword);
      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };

  verifyResetToken = async (req: Request, res: Response) => {
    const { token } = req.query as { token: string };
    console.log(token);
    try {
      const { valid } = await this.verifyResetUC.execute(token);
      res.json({ message: "Reset token verified", valid });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  };
}
